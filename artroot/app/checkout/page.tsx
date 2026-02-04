'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { ArrowLeft, CreditCard, MapPin, Check } from 'lucide-react';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import { getUserSession } from '@/lib/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [cardData, setCardData] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    const session = getUserSession();
    if (!session) {
      alert('Please login to place an order');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      // Place orders for all items in cart
      const orderPromises = cart.map(item => {
        return fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            artworkId: item.artworkId,
            quantity: item.quantity,
            deliveryAddress: fullAddress,
            notes: formData.notes
          })
        });
      });

      const results = await Promise.all(orderPromises);
      const failures = results.filter(r => !r.ok);

      if (failures.length === 0) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          router.push('/dashboard?tab=orders');
        }, 3000);
      } else {
        const errorData = await failures[0].json();
        throw new Error(errorData.error || 'Failed to place some orders');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Something went wrong while placing your order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    router.push('/cart');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#E6E1DC]">
        <Navbar />
        <div className="pt-32 pb-16 flex items-center justify-center">
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#D2691E]/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-[#D2691E]" />
            </div>
            <h2 className="font-serif text-4xl text-[#2B2B2B]">Order Confirmed</h2>
            <p className="font-sans text-[#2B2B2B]/60">Your masterpiece is being prepared for dispatch.</p>
            <p className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40">Redirecting to Dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E1DC]">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <button onClick={() => router.back()} className="flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors font-sans text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>

          <h1 className="font-serif text-4xl text-[#2B2B2B] mb-12">Secure Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-12">

              {/* Shipping */}
              <section>
                <div className="flex items-center mb-6 border-b border-[#2B2B2B]/10 pb-2">
                  <MapPin className="w-5 h-5 text-[#D2691E] mr-3" />
                  <h2 className="font-serif text-xl text-[#2B2B2B]">Shipping Details</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                  <input type="email" name="email" placeholder="Email Address" onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                  <input type="text" name="address" placeholder="Street Address" onChange={handleInputChange} className="md:col-span-2 bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                  <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                  <input type="text" name="pincode" placeholder="PIN Code" onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                </div>
              </section>

              {/* Payment */}
              <section>
                <div className="flex items-center mb-6 border-b border-[#2B2B2B]/10 pb-2">
                  <CreditCard className="w-5 h-5 text-[#D2691E] mr-3" />
                  <h2 className="font-serif text-xl text-[#2B2B2B]">Payment</h2>
                </div>
                <div className="space-y-4">
                  <div onClick={() => setPaymentMethod('cod')} className={`p-4 border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/10'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${paymentMethod === 'cod' ? 'bg-[#D2691E]' : 'bg-gray-300'}`} />
                      <span className="font-sans text-sm font-medium text-[#2B2B2B]">Cash on Delivery</span>
                    </div>
                  </div>
                  <div onClick={() => setPaymentMethod('card')} className={`p-4 border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/10'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${paymentMethod === 'card' ? 'bg-[#D2691E]' : 'bg-gray-300'}`} />
                      <span className="font-sans text-sm font-medium text-[#2B2B2B]">Card Payment</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#2B2B2B] text-[#E6E1DC] p-8 md:sticky md:top-32">
                <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                  {cart.map(item => (
                    <div key={item.artworkId} className="flex gap-3 text-sm">
                      <div className="w-12 h-16 bg-[#E6E1DC]/10 relative flex-shrink-0">
                        {item.image && <Image src={item.image} alt={item.title} fill className="object-cover opacity-80" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-[#E6E1DC]/60 text-xs">x{item.quantity}</p>
                      </div>
                      <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E6E1DC]/20 pt-4 mb-8">
                  <div className="flex justify-between text-lg font-serif">
                    <span>Total</span>
                    <span className="text-[#C9A24D]">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-[#D2691E] hover:bg-[#C9A24D] text-[#E6E1DC] py-4 font-sans text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
