import re
import unicodedata


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFC", text)
    text = re.sub(
        r"[^\w\sàáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
        " ",
        text,
    )
    text = re.sub(r"\s+", " ", text)
    return text.strip()
