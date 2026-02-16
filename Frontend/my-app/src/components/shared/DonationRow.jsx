export function DonationRow({ donation }) {
  const { donationId, amount, transactionReference, donor, timestamp } = donation;

  return (
    <tr className="border-b">
      <td className="py-3 px-4 text-sm font-mono">#{donationId}</td>
      <td className="py-3 px-4 text-sm">{amount} Wei</td>
      <td className="py-3 px-4 text-sm font-mono truncate max-w-37.5" title={donor}>
        {donor.slice(0, 6)}...{donor.slice(-4)}
      </td>
      <td className="py-3 px-4 text-sm">{transactionReference}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {new Date(Number(timestamp) * 1000).toLocaleDateString()}
      </td>
    </tr>
  );
}
