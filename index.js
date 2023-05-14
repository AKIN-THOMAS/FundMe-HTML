import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceBtn")
const withdrawButton = document.getElementById("withdrawBtn")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log("Bishop from script tag")
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("metamask detected")
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        console.log("connected")
        connectButton.innerHTML = "Connected!"
    } else {
        console.log("no metamask detected")
        connectButton.innerHTML = "Please install metamask to connect!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

// console.log(ethers)
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        //provider | blockchain to connect to
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //signer | wallet with some gas to use
        const signer = provider.getSigner()
        //contract to interact with
        //^ABI && Address
        const contracts = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = new contracts.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listnerForTxMine(txResponse, provider)
            console.log("Done!!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listnerForTxMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    // return new Promise()
    //we need a listner for the blockchain | listen for the blockchain to finish funding
    return new Promise((resolve, reject) => {
        provider.once(txResponse, (txReceipt) => {
            console.log(
                `Transaction completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if(typeof window.ethereum !== "undefined"){
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            await listnerForTxMine(txResponse, provider)
        } catch (error) {
            console.log(error);
        }
    }
}