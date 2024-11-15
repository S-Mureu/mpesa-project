function makePayment() {
    const phone = document.getElementById('phone').value;
    const amount = document.getElementById('amount').value;

    fetch('/api/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('response').innerText = 'Payment request sent! Check your phone.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'Failed to initiate payment.';
    });
}
