import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BTC_ADDRESS = 'bc1q3h3z9gg5q0u86vayjjdjm598djzx540czn9qr7';
const ETH_ADDRESS = '0x9EF8145CF17D5e92BE4c7777a54869b4287E3AA5';

interface EtherscanTx {
  hash: string;
  from: string;
  value: string;
  timeStamp: string;
}

interface BlockchainTx {
  hash: string;
  inputs: { prev_out: { addr: string } }[];
  out: { addr: string; value: number }[];
  time: number;
}

async function fetchCryptoPrices(): Promise<{ btc: number; eth: number }> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
    );
    const data = await response.json();
    return {
      btc: data.bitcoin?.usd || 0,
      eth: data.ethereum?.usd || 0,
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return { btc: 0, eth: 0 };
  }
}

async function fetchEthTransactions(apiKey: string): Promise<EtherscanTx[]> {
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${ETH_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && Array.isArray(data.result)) {
      // Filter only incoming transactions
      return data.result.filter((tx: EtherscanTx) => 
        tx.from.toLowerCase() !== ETH_ADDRESS.toLowerCase()
      );
    }
    return [];
  } catch (error) {
    console.error('Error fetching ETH transactions:', error);
    return [];
  }
}

async function fetchBtcTransactions(): Promise<BlockchainTx[]> {
  try {
    const url = `https://blockchain.info/rawaddr/${BTC_ADDRESS}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data.txs)) {
      return data.txs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const etherscanApiKey = Deno.env.get('ETHERSCAN_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const prices = await fetchCryptoPrices();
    console.log('Current prices:', prices);
    
    let ethCount = 0;
    let btcCount = 0;
    
    // Sync ETH transactions
    if (etherscanApiKey) {
      const ethTxs = await fetchEthTransactions(etherscanApiKey);
      console.log(`Found ${ethTxs.length} ETH transactions`);
      
      for (const tx of ethTxs) {
        const amountEth = parseInt(tx.value) / 1e18;
        const amountUsd = amountEth * prices.eth;
        
        const { error } = await supabase
          .from('wallet_transactions')
          .upsert({
            wallet_type: 'ETH',
            transaction_hash: tx.hash,
            amount_native: amountEth,
            amount_usd: amountUsd,
            sender_address: tx.from,
            is_manual_entry: false,
            transaction_date: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
          }, {
            onConflict: 'wallet_type,transaction_hash',
            ignoreDuplicates: true,
          });
        
        if (!error) ethCount++;
      }
    } else {
      console.log('ETHERSCAN_API_KEY not configured, skipping ETH sync');
    }
    
    // Sync BTC transactions
    const btcTxs = await fetchBtcTransactions();
    console.log(`Found ${btcTxs.length} BTC transactions`);
    
    for (const tx of btcTxs) {
      // Find value received at our address
      const receivedOutput = tx.out.find(
        (out) => out.addr === BTC_ADDRESS
      );
      
      if (receivedOutput) {
        const amountBtc = receivedOutput.value / 1e8;
        const amountUsd = amountBtc * prices.btc;
        const senderAddr = tx.inputs[0]?.prev_out?.addr || 'unknown';
        
        const { error } = await supabase
          .from('wallet_transactions')
          .upsert({
            wallet_type: 'BTC',
            transaction_hash: tx.hash,
            amount_native: amountBtc,
            amount_usd: amountUsd,
            sender_address: senderAddr,
            is_manual_entry: false,
            transaction_date: new Date(tx.time * 1000).toISOString(),
          }, {
            onConflict: 'wallet_type,transaction_hash',
            ignoreDuplicates: true,
          });
        
        if (!error) btcCount++;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          eth: ethCount,
          btc: btcCount,
        },
        prices,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
