import sys

def main():
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    term = sys.argv[2]
    for i, line in enumerate(lines):
        if term in line:
            start = max(0, i - 2)
            end = min(len(lines), i + 5)
            print(f"--- Line {i} ---")
            print("".join(lines[start:end]))

if __name__ == '__main__':
    main()
