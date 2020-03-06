import sys
sys.path.insert(0,'/Users/ayunas/Documents/lambda/ls8_cpu/ls8')
from ls8 import LS8
import json

# cpu = LS8()

class LS8_DECODER(LS8):
    def __init__(self):
        LS8.__init__(self)

    # def pra(self):
    #     reg = self.ram_read(1)
    #     self.reg_read(reg,True)
    
    # def ram_read(self,n):
    #     # self.pc += 1
    #     mdr = self.ram[self.pc + n]  #memory data register
    #     return mdr
    
    def reg_read(self,reg, asci=None):
        if asci:
             print(f'r[{reg}]: {chr(self.registers[reg])}')
            #  json.dump(chr(self.registers[reg]))
             f = open('ls8_code.txt', 'a')
             f.write(chr(self.registers[reg]))
             f.close()

        else:
            print(f'r[{reg}]: {self.registers[reg]}')
        return self.registers[reg]
        # self.pc += 1
    

cpu = LS8_DECODER()
f = open('ls8_code.txt', 'w')  #clear out contents of file before 
f.close()
cpu.run()





