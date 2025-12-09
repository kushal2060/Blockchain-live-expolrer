
//transaction struct
use serde::{Deserialize,Serialize};
#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub block_number: u64,
    pub timestamp: u64,
    pub fee: u64,
    pub input_count: u32,
    pub output_count: u32,
    pub total_output: u64,
}

impl Transaction {
    pub fn new(hash: String,block_number: u64,timestamp:u64,fee:u64,input_count:u32,
               output_count: u32,total_output:u64 ) -> Self {
                Self { hash, block_number, timestamp, fee, input_count, output_count, total_output }
               }
}