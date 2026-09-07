/**
 * ==============================================================================
 * MODULE: ShopeeApiService.js
 * MÔ TẢ: Module xử lý giao tiếp cốt lõi với Shopee Open Platform API v2.
 *        - Mã hóa chữ ký số HMAC-SHA256 chuẩn Shopee specification.
 *        - Tự động làm mới access_token qua refresh_token khi hết hạn (mã lỗi error_auth, error_permission).
 *        - Tải cấu hình đối tác và gian hàng từ Script Properties.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

const ShopeeApiService = {
  BASE_URL: 'https://partner.shopeemobile.com',

  /**
   * Lấy cấu hình xác thực Shopee API từ Script Properties
   * @returns {Object}
   */
  getConfig: function() {
    const props = PropertiesService.getScriptProperties();
    const partnerIdStr = props.getProperty('SHOPEE_PARTNER_ID');
    const shopIdStr = props.getProperty('SHOPEE_SHOP_ID');

    return {
      partnerId: partnerIdStr ? Number(partnerIdStr) : 0,
      partnerKey: props.getProperty('SHOPEE_PARTNER_KEY') || '',
      shopId: shopIdStr ? Number(shopIdStr) : 0,
      accessToken: props.getProperty('SHOPEE_ACCESS_TOKEN') || '',
      refreshToken: props.getProperty('SHOPEE_REFRESH_TOKEN') || ''
    };
  },

  /**
   * Lưu hoặc cập nhật nhanh cấu hình xác thực Shopee API vào Script Properties
   * @param {Object} configObj 
   */
  saveConfig: function(configObj) {
    const props = PropertiesService.getScriptProperties();
    if (configObj.partnerId) props.setProperty('SHOPEE_PARTNER_ID', String(configObj.partnerId));
    if (configObj.partnerKey) props.setProperty('SHOPEE_PARTNER_KEY', String(configObj.partnerKey));
    if (configObj.shopId) props.setProperty('SHOPEE_SHOP_ID', String(configObj.shopId));
    if (configObj.accessToken) props.setProperty('SHOPEE_ACCESS_TOKEN', String(configObj.accessToken));
    if (configObj.refreshToken) props.setProperty('SHOPEE_REFRESH_TOKEN', String(configObj.refreshToken));
    Logger.log('✅ Đã lưu cấu hình Shopee API vào Script Properties.');
  },

  /**
   * Tạo chữ ký HMAC-SHA256 chuẩn Shopee API v2
   * Công thức: HMAC-SHA256(partner_id + path + timestamp + access_token + shop_id, partner_key)
   * 
   * @param {string} path - Đường dẫn API (vd: /api/v2/order/get_order_list)
   * @param {number} timestamp - Unix timestamp theo giây
   * @param {string} accessToken - Access token (tùy chọn)
   * @param {number|string} shopId - Shop ID (tùy chọn)
   * @returns {string} Hex signature lowercase
   */
  generateSign: function(path, timestamp, accessToken = '', shopId = '') {
    const config = this.getConfig();
    if (!config.partnerKey) {
      throw new Error('[ShopeeApiService] Chưa cấu hình SHOPEE_PARTNER_KEY trong Script Properties.');
    }

    let baseStr = `${config.partnerId}${path}${timestamp}`;
    if (accessToken) baseStr += accessToken;
    if (shopId) baseStr += shopId;

    const signatureBytes = Utilities.computeHmacSha256Signature(baseStr, config.partnerKey);
    return signatureBytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  },

  /**
   * Tự động làm mới Access Token khi hết hạn qua refresh_token
   * @returns {string} Access Token mới
   */
  refreshAccessToken: function() {
    const config = this.getConfig();
    if (!config.partnerId || !config.partnerKey || !config.refreshToken) {
      throw new Error('[ShopeeApiService.refreshAccessToken] Thiếu thông tin partnerId, partnerKey hoặc refreshToken.');
    }

    const path = '/api/v2/auth/access_token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = this.generateSign(path, timestamp);

    const url = `${this.BASE_URL}${path}?partner_id=${config.partnerId}&timestamp=${timestamp}&sign=${sign}`;
    const payload = {
      partner_id: config.partnerId,
      refresh_token: config.refreshToken,
      shop_id: config.shopId
    };

    Logger.log('[ShopeeApiService] Đang gọi API làm mới Access Token...');

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const resData = JSON.parse(response.getContentText());
    if (resData.error && resData.error !== '') {
      const errMsg = `Refresh Token thất bại [${resData.error}]: ${resData.message || resData.msg || ''}`;
      Logger.log(`❌ ${errMsg}`);
      ShopeeDbService.logAudit('Shopee_API_Auth', 'REFRESH_TOKEN_FAILED', 'AUTH', errMsg, 'FAILED', resData);
      throw new Error(errMsg);
    }

    // Lưu token mới vào Script Properties
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SHOPEE_ACCESS_TOKEN', resData.access_token);
    if (resData.refresh_token) {
      props.setProperty('SHOPEE_REFRESH_TOKEN', resData.refresh_token);
    }

    Logger.log('✅ Đã làm mới và lưu Access Token thành công.');
    ShopeeDbService.logAudit('Shopee_API_Auth', 'REFRESH_TOKEN_SUCCESS', 'AUTH', 'Đã cấp mới Access Token thành công', 'SUCCESS', {
      expire_in: resData.expire_in
    });

    return resData.access_token;
  },

  /**
   * Thực hiện gọi API Shopee v2 tổng quát kèm cơ chế tự động refresh token nếu hết hạn
   * 
   * @param {string} path - API path (vd: /api/v2/order/get_order_detail)
   * @param {Object} queryParams - Các tham số URL query
   * @param {string} method - 'get' hoặc 'post'
   * @param {Object|null} body - Dữ liệu body nếu method là post
   * @returns {Object} response payload từ Shopee
   */
  request: function(path, queryParams = {}, method = 'get', body = null) {
    let config = this.getConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = this.generateSign(path, timestamp, config.accessToken, config.shopId);

    const mergedParams = Object.assign({}, queryParams, {
      partner_id: config.partnerId,
      timestamp: timestamp,
      access_token: config.accessToken,
      shop_id: config.shopId,
      sign: sign
    });

    const queryString = Object.keys(mergedParams)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(mergedParams[k])}`)
      .join('&');

    const url = `${this.BASE_URL}${path}?${queryString}`;
    const options = {
      method: method.toLowerCase(),
      contentType: 'application/json',
      muteHttpExceptions: true
    };
    if (body && method.toLowerCase() === 'post') {
      options.payload = JSON.stringify(body);
    }

    let res = UrlFetchApp.fetch(url, options);
    let data = JSON.parse(res.getContentText());

    // Tự động xử lý nếu Access Token hết hạn (Error: error_auth, error_permission, error_sign)
    if (data.error === 'error_auth' || data.error === 'error_permission' || data.error === 'error_param_access_token') {
      Logger.log(`[ShopeeApiService] Nhận mã lỗi token (${data.error}). Đang tự động refresh token và thử lại...`);
      const newToken = this.refreshAccessToken();
      
      const retryTimestamp = Math.floor(Date.now() / 1000);
      const retrySign = this.generateSign(path, retryTimestamp, newToken, config.shopId);

      mergedParams.timestamp = retryTimestamp;
      mergedParams.access_token = newToken;
      mergedParams.sign = retrySign;

      const retryQueryString = Object.keys(mergedParams)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(mergedParams[k])}`)
        .join('&');

      res = UrlFetchApp.fetch(`${this.BASE_URL}${path}?${retryQueryString}`, options);
      data = JSON.parse(res.getContentText());
    }

    if (data.error && data.error !== '') {
      const errDetail = `Shopee API Error [${data.error}]: ${data.message || data.msg || JSON.stringify(data)}`;
      Logger.log(`❌ [ShopeeApiService] ${errDetail}`);
      throw new Error(errDetail);
    }

    return data.response || data;
  }
};
