class Cipher:
    ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    @staticmethod
    def transposition_cipher(text: str) -> str:
        text = text.replace(" ", "").upper()
        temp = ""
        temp1 = ""
        for counter, char in enumerate(text):
            if counter % 2 == 0:
                temp += char
            else:
                temp1 += char
        return temp + temp1

    @staticmethod
    def giovanni_cipher(text: str, keyword: str, key_letter: str) -> str:
        temp = ""
        for c in keyword.upper():
            if c not in temp:
                temp += c

        temp1 = temp
        for c in Cipher.ALPHABET:
            if c not in temp1:
                temp1 += c

        key_index = Cipher.ALPHABET.index(key_letter.upper())
        temp2 = temp1[len(temp1) - key_index:] + temp1[:len(temp1) - key_index]

        cipher = ""
        for c in text.upper():
            if c == ' ':
                cipher += " "
            elif c not in Cipher.ALPHABET:
                cipher += c
            else:
                b = Cipher.ALPHABET.index(c)
                cipher += temp2[b]

        return cipher

    @staticmethod
    def keyword_cipher(text: str, keyword: str) -> str:
        temp = ""
        for c in keyword.upper():
            if c not in temp:
                temp += c

        temp1 = temp
        for c in Cipher.ALPHABET:
            if c not in temp1:
                temp1 += c

        cipher = ""
        for c in text.upper():
            if c == ' ':
                cipher += " "
            elif c not in Cipher.ALPHABET:
                cipher += c
            else:
                b = Cipher.ALPHABET.index(c)
                cipher += temp1[b]

        return cipher

    @staticmethod
    def caesar_cipher(text: str, shift: int) -> str:
        temp = Cipher.ALPHABET[shift:] + Cipher.ALPHABET[:shift]

        cipher = ""
        for c in text.upper():
            if c == ' ':
                cipher += " "
            elif c not in Cipher.ALPHABET:
                cipher += c
            else:
                b = Cipher.ALPHABET.index(c)
                cipher += temp[b]

        return cipher