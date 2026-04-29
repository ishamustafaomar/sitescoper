const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;
  return (
    <div className="w-full bg-orange-100 dark:bg-orange-900/30 border-b border-orange-300 dark:border-orange-800/60 px-4 py-2 text-center text-xs text-orange-800 dark:text-orange-200">
      All payments in the preview are in test mode. Use card{" "}
      <code className="font-mono">4242 4242 4242 4242</code>.
    </div>
  );
}