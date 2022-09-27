string = input("Enter string: ")
print("STR,"+"\n    ".join(f"DEC {ord(i)}" for i in string+"\0")+"\nPTR,HEX STR")
