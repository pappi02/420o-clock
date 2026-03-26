const OrderStatusSelect = ({ current, onChange, disabled }) => {
  const statuses = [
    'awaiting_location',
    'payment_confirmed',
    'processing', 
    'out_for_delivery',
    'delivered',
    'cancelled'
  ]

  return (
    <select 
      value={current} 
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="status-select"
    >
      {statuses.map(status => (
        <option key={status} value={status}>
          {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </option>
      ))}
    </select>
  )
}

export default OrderStatusSelect

