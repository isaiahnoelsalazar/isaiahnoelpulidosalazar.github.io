from .builder_for_flask_jsonify import bake
from .check import has_numbers, has_numbers2, has_spaces, has_spaces2, has_symbols, has_symbols2
from .cipher import caesar_cipher, decipher_caesar_cipher, decipher_keyword_cipher, keyword_cipher, transposition_cipher
from .convert import base64_to_string, string_to_base64
from .dictionarily import Dictionarily
from .easy_sql import EasySQL
from .excellent_reader import get_first_column_from_all_sheets, get_first_column_from_sheet_index
from .stackily import Stackily
from .test import test_method

# changes:
# - rework excellent_reader
# - rework check
# - rework sort
# - rework cipher
# - rework convert
# - add simple_file_handler