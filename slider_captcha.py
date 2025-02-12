# slider_captcha.py
import ddddocr

def recognize_slider(background_path, slider_path):
    ocr = ddddocr.DdddOcr(det=False, ocr=False, show_ad=False)
    with open(background_path, 'rb') as f:
        background_bytes = f.read()
    with open(slider_path, 'rb') as f:
        slider_bytes = f.read()
    res = ocr.slide_match(slider_bytes, background_bytes, simple_target=True)
    return res['target'][0]

if __name__ == '__main__':
    import sys
    background_path = sys.argv[1]
    slider_path = sys.argv[2]
    distance = recognize_slider(background_path, slider_path)
    print(distance)