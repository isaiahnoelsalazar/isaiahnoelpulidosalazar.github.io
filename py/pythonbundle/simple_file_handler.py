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

    @staticmethod
    def project_to_location(package_name: str, file_name: str, file_path: str = None) -> None:
        try:
            if file_path is None:
                target_path = file_name
                target_dir = os.path.dirname(target_path)
            else:
                target_dir = file_path
                target_path = os.path.join(target_dir, os.path.basename(file_name))

            if target_dir and not os.path.exists(target_dir):
                os.makedirs(target_dir)

            resource_data = pkgutil.get_data(package_name, os.path.basename(file_name))
            
            if resource_data is None:
                raise FileNotFoundError("Resource not found within the package.")

            with open(target_path, 'wb') as project_file:
                project_file.write(resource_data)

        except Exception as e:
            print("Cannot copy project file. Error:", e)