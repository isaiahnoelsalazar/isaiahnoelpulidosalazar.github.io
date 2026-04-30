import re
import base64
import os
import pkgutil

class Check:
    class Email:
        valid_domain_names = []
        valid_domain_extensions = []
        valid_domains =[]
        _should_use_full_domain = False

        @classmethod
        def add_valid_domain_name(cls, string: str):
            cls.valid_domain_names.append(string)

        @classmethod
        def add_valid_domain_extension(cls, string: str):
            cls.valid_domain_extensions.append(string)

        @classmethod
        def add_valid_domain(cls, string: str):
            cls.valid_domains.append(string)

        @classmethod
        def should_use_full_domain(cls, boolean: bool = True):
            cls._should_use_full_domain = boolean

        @classmethod
        def is_valid(cls, string: str) -> bool:
            if cls._should_use_full_domain:
                try:
                    domain = string.split('@')
                    return domain[1] in cls.valid_domains
                except Exception:
                    return False
            else:
                try:
                    domain = string.split('@')
                    domain_parts = domain[1].split('.')
                    domain_name = domain_parts[0]
                    domain_extension = domain_parts[1]
                    return (domain_name in cls.valid_domain_names and 
                            domain_extension in cls.valid_domain_extensions)
                except Exception:
                    return False

    @staticmethod
    def is_a_valid_philippine_mobile_number(string: str) -> bool:
        pattern = r"^(?:09|\+639|639)\d{9}$"
        cleaned = re.sub(r"[\s\-\(\)]", "", string)
        return bool(re.match(pattern, cleaned))

    @staticmethod
    def is_all_numbers(string: str) -> bool:
        numbers = "0123456789"
        return all(char in numbers for char in string)

    @staticmethod
    def has_numbers(string: str) -> bool:
        numbers = "0123456789"
        return any(char in numbers for char in string)

    @staticmethod
    def has_symbols(string: str) -> bool:
        symbols = "~`!@#$%^&*()_+-=[]{}\\|'\";:,.<>/?"
        return any(char in symbols for char in string)

    @staticmethod
    def has_spaces(string: str) -> bool:
        return ' ' in string
