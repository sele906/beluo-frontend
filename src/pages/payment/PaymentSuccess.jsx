import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold mb-3">Payment completed!</h1>
      <p className="text-gray-600 mb-6">
        Your credits have been added to your account.
      </p>

      <Link
        to="/mypage"
        className="px-4 py-2 rounded-lg bg-black text-white"
      >
        Go to My Page
      </Link>
    </div>
  );
}

export default PaymentSuccess;