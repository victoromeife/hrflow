from PyPDF2 import PdfReader
r = PdfReader(r"C:\Users\victo\Documents\hrflow\BRTGC Engineering Assessment Intern-2.pdf")
out = []
for i, p in enumerate(r.pages):
    out.append(f"--- PAGE {i+1} ---")
    out.append(p.extract_text())
with open("pdf_text.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("done", len(r.pages))