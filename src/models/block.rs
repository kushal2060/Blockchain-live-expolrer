
//block struct
 use serde::{Deserialize,Serialize};

#[derive(Debug,Clone,Serialize,Deserialize)] //traits for struct
pub struct Block {
    pub hash: String,
    pub number: u64,
    pub slot: u64,
    pub epoch: u64,
    pub timestamp: u64,
    pub tx_count: u32,
    pub size: u64,
}

//constructor
impl Block { //methods
    pub fn new(hash:String,number:u64,slot:u64,epoch:u64,
        timestamp: u64,tx_count:u32,size: u64)-> Self{
            Self { hash, number, slot, epoch, timestamp, tx_count, size }
    }
}
