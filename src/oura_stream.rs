use  std::{os::macos::raw::stat, process::Child, sync::Arc};

use tokio::sync::RwLock;
use crate::models::{Block,Transaction, transaction};

//common state
pub struct BlockChainState {
    pub blocks: Arc<RwLock<Vec<Block>>>,
    pub transactions: Arc<RwLock<Vec<Transaction>>>,
}

impl BlockChainState {
    pub fn new() -> Self {
        Self { blocks: Arc::new(RwLock::new(Vec::new())), 
            transactions: Arc::new(RwLock::new(Vec::new())) }
    }
    pub async fn add_block(&self,block:Block){
        let mut blocks = self.blocks.write().await;
        blocks.insert(0, block);

        //only last 100 blocks 
        if blocks.len() >100 {
            blocks.truncate(100);
        }
    }

    pub async fn add_transactions(&self,tx:Transaction){
        let mut transactions = self.transactions.write().await;
        transactions.insert(0,tx); 

        //only 500
        if transactions.len() > 500 {
            transactions.truncate(500);
        }
    }

    pub async fn get_blocks(&self,limit: usize) -> Vec<Block> {
        let blocks = self.blocks.read().await;
        blocks.iter().take(limit).cloned().collect()
    }

    pub async fn get_transactions(&self,limit: usize) -> Vec<Transaction> {
        let transactions =self.transactions.read().await;
        transactions.iter().take(limit).cloned().collect()
    }
}

//spwan oura as subprocess and parse stdout

pub async fn start_oura(state: Arc<BlockChainState>){
    use std::process::{Command,Stdio};
    use std::io::{BufRead,BufReader};

    tokio::spawn(async move {
        log::info!("Starting out oura stream");

        let mut child = Command::new("oura").args(
            &[
                "dump",
                "preprod-node.world.dev.cardano.org.30000",
                "--bearer","tcp",
                "--magic","pre-prod",
            ]).stdout((Stdio::piped())).spawn().expect("Failed to start Oura");
   
            let stdout= child.stdout.take().expect("Failed to stdout");
            let reader = BufReader::new(stdout);

            for line in reader.lines(){
                match line {
                    Ok(line_str) => {
                        if let Ok(event) = serde_json::from_str::<serde_json::Value>(&line_str) {
                            process_event(event,state.clone()).await;
                        }
                    }
                    Err(e) => log::error!("Error reading Oura output: {}",e),
                }
            }
            log::warn!("Oyra stream ended");
    });

}

async fn process_event(event:serde_json::Value,state: Arc<BlockChainState>){
    //eveent type
    if let Some(event_obj) = event.get("event") {
        if let Some(block_data) = event_obj.get("block") {
            let context = event.get("context").unwrap();

            let block = Block::new (
                context.get("block_hash").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                context.get("block_number").and_then(|v| v.as_u64()).unwrap_or(0),
                context.get("slot").and_then(|v| v.as_u64()).unwrap_or(0),
                context.get("epoch").and_then(|v| v.as_u64()).unwrap_or(0),
                context.get("timestamp").and_then(|v| v.as_u64()).unwrap_or(0),
                block_data.get("tx_count").and_then(|v| v.as_u64()).unwrap_or(0) as u32,
                block_data.get("size").and_then(|v| v.as_u64()).unwrap_or(0),
            );
            log::info!("New block: #{} - {}",block.number,&block.hash[..16]);
            state.add_block(block).await;
        }

        if let Some(tx_data) = event_obj.get("transaction"){
            //now tranaction
            let context = event.get("context").unwrap();
            
            let tx = Transaction::new(
                tx_data.get("hash").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                context.get("block_number").and_then(|v| v.as_u64()).unwrap_or(0),
                context.get("timestamp").and_then(|v| v.as_u64()).unwrap_or(0),
                tx_data.get("fee").and_then(|v| v.as_u64()).unwrap_or(0),
                tx_data.get("input_count").and_then(|v| v.as_array()).map(|arr| arr.len() as u32).unwrap_or(0),
                tx_data.get("output_count").and_then(|v| v.as_array()).map(|arr| arr.len() as u32).unwrap_or(0),
                tx_data.get("total_output").and_then(|v| v.as_u64()).unwrap_or(0), 
            );

            log::debug!("New transaction : {}",&tx.hash[..16]);
            state.add_transactions(tx).await;

    }
    }
}