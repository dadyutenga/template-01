#!/bin/bash

# Upload Testing Script
# This script helps test large file uploads to ensure they work correctly

echo "🧪 Kibegi Upload Testing Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test files directory
TEST_DIR="./test-uploads"
mkdir -p "$TEST_DIR"

echo -e "${BLUE}📁 Test files will be created in: $TEST_DIR${NC}"
echo ""

# Function to create test file
create_test_file() {
    local size_mb=$1
    local filename=$2
    local size_bytes=$((size_mb * 1024 * 1024))
    
    echo -e "${YELLOW}📝 Creating ${size_mb}MB test file: $filename${NC}"
    
    # Create file with random data (more realistic than zeros)
    if command -v dd &> /dev/null; then
        dd if=/dev/urandom of="$TEST_DIR/$filename" bs=1M count=$size_mb 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Created: $filename (${size_mb}MB)${NC}"
            ls -lh "$TEST_DIR/$filename"
        else
            echo -e "${RED}❌ Failed to create $filename${NC}"
        fi
    else
        # Fallback for systems without dd
        python3 -c "import os; open('$TEST_DIR/$filename', 'wb').write(os.urandom($size_bytes))" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Created: $filename (${size_mb}MB)${NC}"
            ls -lh "$TEST_DIR/$filename"
        else
            echo -e "${RED}❌ Failed to create $filename (dd and python3 not available)${NC}"
        fi
    fi
    echo ""
}

echo "Select test file sizes to create:"
echo "1. Small file (1MB)"
echo "2. Medium file (10MB)"
echo "3. Large file (25MB)"
echo "4. Very large file (45MB)"
echo "5. Maximum file (50MB)"
echo "6. All test files"
echo "7. Skip file creation"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        create_test_file 1 "test-small-1mb.bin"
        ;;
    2)
        create_test_file 10 "test-medium-10mb.bin"
        ;;
    3)
        create_test_file 25 "test-large-25mb.bin"
        ;;
    4)
        create_test_file 45 "test-verylarge-45mb.bin"
        ;;
    5)
        create_test_file 50 "test-maximum-50mb.bin"
        ;;
    6)
        echo -e "${YELLOW}Creating all test files...${NC}"
        echo ""
        create_test_file 1 "test-small-1mb.bin"
        create_test_file 10 "test-medium-10mb.bin"
        create_test_file 25 "test-large-25mb.bin"
        create_test_file 45 "test-verylarge-45mb.bin"
        create_test_file 50 "test-maximum-50mb.bin"
        ;;
    7)
        echo -e "${YELLOW}Skipping file creation${NC}"
        echo ""
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Display test instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 Testing Instructions${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Start your development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Open the app in your browser"
echo ""
echo "3. Navigate to the Upload page"
echo ""
echo "4. Try uploading the test files created above"
echo ""
echo "5. Check browser console for detailed logs:"
echo "   - 🔵 Info/Debug messages"
echo "   - 🟢 Success messages"
echo "   - 🔴 Error messages"
echo "   - 📤 Upload progress"
echo ""
echo "6. Verify upload functionality:"
echo "   ✓ File size validation (should reject > 50MB)"
echo "   ✓ Upload progress indicator"
echo "   ✓ Success notification"
echo "   ✓ File appears in file list"
echo ""
echo -e "${YELLOW}Testing Tips:${NC}"
echo "• Test on both desktop and mobile browsers"
echo "• Try throttling network in DevTools (Slow 3G)"
echo "• Test with different file types (not just .bin)"
echo "• Verify uploads work on slow connections"
echo "• Check backend logs for any server errors"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Test files location: $TEST_DIR${NC}"
echo ""
echo "To clean up test files later, run:"
echo "  ${YELLOW}rm -rf $TEST_DIR${NC}"
echo ""
