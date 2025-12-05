# FormAssist

FormAssist is a web-based application designed to help ward/gram volunteers, ASHA workers, Anganwadi staff, and citizens generate formal letters in Telugu and English from short Telugu inputs. Many field workers face challenges converting spoken descriptions into structured complaint letters, applications, and field visit summaries needed for government service delivery.

The system captures Telugu speech through the browser and converts it to text using the Web Speech API. This text is then processed using Bhashini services such as text normalization, language detection, transliteration, and neural machine translation. These services help clean the user’s text, identify the language, convert between Telugu and English, and produce translated content suitable for official communication.

The final output is automatically inserted into predefined templates for complaints, applications, and reports. This tool aims to simplify documentation for low-literacy users, reduce manual typing effort, and support inclusive governance. Bhashini APIs are essential to ensure high-quality Telugu and English outputs.
