// otpUtils.js

// Generate the same OTP for a 2-day interval using a date-based seed
export const generateStaticOtp = () => {
  const now = new Date();

  // Get time rounded down to the nearest 2-day interval (in milliseconds)
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
  const roundedTime = Math.floor(now.getTime() / twoDaysInMs) * twoDaysInMs;

  // Use a simple deterministic algorithm to generate a pseudo-OTP
  const seed = String(roundedTime);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to 6-digit OTP
  const otp = Math.abs(hash % 1000000).toString().padStart(6, '0');
  return otp;
};
