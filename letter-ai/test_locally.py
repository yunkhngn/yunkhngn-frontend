import cv2
import numpy as np
import os
import sys

# Thêm directory hiện tại vào path để import được services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.image_processor import generate_reveal_map, validate_scan

def test_on_local_file(image_path):
    print(f"--- Đang test ảnh: {image_path} ---")
    
    # 1. Đọc ảnh
    img = cv2.imread(image_path)
    if img is None:
        print(f"Lỗi: Không tìm thấy hoặc không đọc được file {image_path}")
        return

    # 2. Chạy Validation
    validation = validate_scan(img)
    print(f"Kết quả Validation: {'✅ Hợp lệ' if validation['valid'] else '❌ Không hợp lệ'}")
    if validation['issues']:
        for issue in validation['issues']:
            print(f"  - {issue}")
    
    # 3. Chạy thuật toán Reveal Map
    print("Đang xử lý tạo Reveal Map...")
    try:
        reveal_map_bytes = generate_reveal_map(img)
        
        # Decode bytes ngược lại thành ảnh OpenCV để lưu
        nparr = np.frombuffer(reveal_map_bytes, np.uint8)
        reveal_map_img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        # 4. Lưu kết quả
        output_path = "reveal_map_result.png"
        cv2.imwrite(output_path, reveal_map_img)
        print(f"✅ Đã lưu kết quả tại: {output_path}")
        print("Mẹo: Mở file này lên, các phần màu tối sẽ hiện trước, màu sáng hiện sau.")
        
    except Exception as e:
        print(f"❌ Xử lý lỗi: {e}")

if __name__ == "__main__":
    # Đường dẫn file của bạn
    sample_path = "/Volumes/Data/Code/web/yunkhngn-website/sample.jpg"
    test_on_local_file(sample_path)
