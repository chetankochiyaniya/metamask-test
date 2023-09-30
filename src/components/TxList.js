export default function TxList({ txs }) {
  if (!txs) return null;

  return (
    <>
      <div className="alert alert-info mt-5">
        <div className="flex-1">
          <label>{txs}</label>
        </div>
      </div>
    </>
  );
}
