const config = require("./hardhat.config.js");
const abi = require("./abi.json")
const ethers = require("ethers")

async function main() {
  const accounts = config.networks.alfajores.accounts;
  const provider = ethers.getDefaultProvider(config.networks.alfajores.url)
  const index = 0; // first wallet, increment for next wallets
  const wallet = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
  const privateKey = wallet.privateKey;
  const walletAddress = wallet.address;
  const walletSigner = wallet.connect(provider);
  const balance = (await walletSigner.getBalance()).toString();
  console.log("Account pvt key:", privateKey);
  console.log("Account address:", walletAddress);
  console.log("Account balance:", balance);

  if (balance < 100000000000) {
    console.log("pop up the account");
    return;
  }
  console.log("conectando ao contrato")
  const odoyaSC = new ethers.Contract("0x19C5EA918Bc7A6DA8E58d1359819F89B5ecae7b1", abi, walletSigner);
  console.log("conectado ao contrato")
  console.log("enviando addRegenAction")
  const currentBlock = await provider.getBlockNumber();
  const blockTimestamp = (await provider.getBlock(currentBlock)).timestamp;
  console.log("blockTimestamp", blockTimestamp);
  const dataFuturaSeg = blockTimestamp+40
  console.log("data futura", dataFuturaSeg)
  // return;
  console.log("enviando addRegenAction...")
  let tx = await odoyaSC.addRegenAction(walletAddress, "Teste de Limpeza Praia Boqueirão", "-23.5489,-46.6388", dataFuturaSeg, ethers.BigNumber.from("1000"));
  console.log("addRegenAction enviado")
  let txReceiptWait = await tx.wait()
  console.log("addRegenAction processado")
  console.log("recibo do addRegenAction", txReceiptWait)
  if (txReceiptWait.status === 1) {
    console.info(`Tx OK: ${txReceiptWait.transactionHash}`)	
  } else {
    console.error("Deu ruim")
    return
  }
  const novoActionID = await odoyaSC.regenActionCounter();
  let action = await odoyaSC.regenActionPlanned(novoActionID);
  console.log("action:", action);
  ////////
  console.log("esperando tempo para inicio da acao...")
  await new Promise(resolve => setTimeout(resolve, 30000));
  tx = undefined
  txReceiptWait = undefined
  console.log("mintando recompensa");
  tx = await odoyaSC.mint("0x263C3Ab7E4832eDF623fBdD66ACee71c028Ff591", ethers.BigNumber.from("10"), novoActionID);
  txReceiptWait = await tx.wait()
  console.log("mint processado")
  console.log("recibo do mint", txReceiptWait)
  if (txReceiptWait.status === 1) {
    console.info(`Tx do mint OK: ${txReceiptWait.transactionHash}`)	
  } else {
    console.error("Deu ruim")
    return
  }
  const saldoEmToken = (await odoyaSC.balanceOf("0x263C3Ab7E4832eDF623fBdD66ACee71c028Ff591")).toString()
  console.log("Saldo do voluntario", saldoEmToken)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});