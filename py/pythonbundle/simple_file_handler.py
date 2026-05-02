class SimpleFileHandler:
    @staticmethod
    def write(file_path: str, content: str) -> None:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

    @staticmethod
    def read(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()

    @staticmethod
    def append(file_path: str, content: str) -> None:
        with open(file_path, 'a', encoding='utf-8') as file:
            file.write(content)