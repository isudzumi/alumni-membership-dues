import { useState } from 'react'
import './App.css'

function App() {
  const [isAnnualPayment, setIfAnnualPayment] = useState(true)

  return (
    <div className="App">
      <div className="product">
        <div className="description">
          <h1>志空会 年会費</h1>
          <h5>¥2000{isAnnualPayment ? ' / year' : ''}</h5>
        </div>
      </div>
      <form method="POST">
        <label htmlFor="annual_payment">継続支払いにする</label>
        <input type="checkbox" id="annual_payment" onClick={() => setIfAnnualPayment(!isAnnualPayment)} />
        <button id="checkout-and-portal-button" type="submit">
          支払う
        </button>
      </form>
    </div>
  )
}

export default App
