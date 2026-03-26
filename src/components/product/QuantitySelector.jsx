import './QuantitySelector.css'

const QuantitySelector = ({ value, onChange, max = 10, min = 1 }) => {
  const decrement = () => {
    if (value > min) onChange(value - 1)
  }

  const increment = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className="quantity-selector">
      <button 
        className="quantity-btn quantity-decrement"
        onClick={decrement}
        disabled={value <= min}
      >
        −
      </button>
      
      <div className="quantity-value">
        {value}
      </div>
      
      <button 
        className="quantity-btn quantity-increment"
        onClick={increment}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  )
}

export default QuantitySelector

