import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Payment() {
  const { bookingId } = useParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      // In production, integrate Razorpay checkout.js here before calling confirm-payment
      // with the verified payment signature. This simulates a successful payment.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const res = await api.post(`/bookings/${bookingId}/confirm-payment`);
      navigate('/my-bookings', { state: { justBooked: res.data.bookingRef } });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg shadow text-center">
      <h1 className="text-xl font-bold mb-2">Complete Payment</h1>
      <p className="text-gray-500 text-sm mb-6">
        Booking #{bookingId} • Test mode (Razorpay integration point)
      </p>
      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">{error}</p>}
      <button
        onClick={handlePay}
        disabled={processing}
        className="w-full bg-indiagreen text-white py-3 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
      >
        {processing ? 'Processing payment...' : 'Pay Now'}
      </button>
      <p className="text-xs text-gray-400 mt-4">
        This is a simulated payment for demo purposes. No real money is charged.
      </p>
    </div>
  );
}
