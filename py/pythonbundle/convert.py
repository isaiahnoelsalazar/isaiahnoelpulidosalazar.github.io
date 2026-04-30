class Convert:
    @staticmethod
    def reverse(string: str) -> str:
        return string[::-1]

    @staticmethod
    def to_base64(string: str) -> str:
        return base64.b64encode(string.encode('utf-8')).decode('utf-8')

    @staticmethod
    def from_base64(string: str) -> str:
        return base64.b64decode(string.encode('utf-8')).decode('utf-8')

    @staticmethod
    def to_byte_array(string: str) -> bytes:
        return string.encode('utf-8')

    @staticmethod
    def from_byte_array(array: bytes) -> str:
        return array.decode('utf-8')

    @staticmethod
    def from_hex(string: str) -> str:
        return "".join(chr(int(string[i:i+2], 16)) for i in range(0, len(string), 2))

    @staticmethod
    def from_binary(string: str) -> str:
        return "".join(chr(int(string[i:i+8], 2)) for i in range(0, len(string), 8))

    @staticmethod
    def to_binary(string: str) -> str:
        return "".join(format(ord(c), '08b') for c in string)

    @staticmethod
    def to_hex(string: str) -> str:
        return "".join(format(ord(c), '02X') for c in string)

    @staticmethod
    def to_int(string: str) -> int:
        return int(string)

    @staticmethod
    def to_double(string: str) -> float:
        return float(string)

    @staticmethod
    def to_long(string: str) -> int:
        return int(string)

    @staticmethod
    def to_float(string: str) -> float:
        return float(string)
