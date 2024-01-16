""" It is a Flask server that sign a transaction and send the signed transaction back to the client. """

from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import math as Math


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)  # Adjust origins as needed

@app.route("/", methods=["POST", "OPTIONS"])
def handle_post_request():
    try:
        myPrivateKey = "053cfea0a9b35fb9608ab27a55d4392e89ab13a556e19bf1f03ef93ebc76ff53"
        data = request.get_json()  # 獲取POST請求中的JSON數據
        receiver_address = data.get('receiverAddress')
        value = data.get('value')
        
        # 在這裡可以使用receiver_address和value進行相應的處理
        # 例如：存儲到數據庫，執行某些業務邏輯，等等。
        """  sign a transaction and send the raw transaction back to the client. """
        # 1. 連接到以太坊節點
        w3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/20afaf6225ba454ab4ef10b82f76ba0c"))
        # 2. 獲取nonce
        PA=w3.eth.account.from_key(myPrivateKey)
        nonce = w3.eth.get_transaction_count(PA.address,'pending')
        gas_price = w3.eth.gas_price
        newGasPrice = Math.floor(float(gas_price) * 1.1)
        # 3. 創建交易
        transaction = {
            "to": receiver_address,
            "value": w3.to_wei(value, "ether"),
            "gas": 2000000,
            "gasPrice": newGasPrice,
            "nonce": nonce,
            "chainId": 11155111
        }
        # 4. 簽名交易
        signed_transaction = w3.eth.account.sign_transaction(transaction, myPrivateKey)
        print(signed_transaction)
        """ return the signed transaction to the client. """
        return jsonify({"status": "success", "message": "signed transaction", "data": signed_transaction.rawTransaction.hex(),})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == "__main__":
    app.run()