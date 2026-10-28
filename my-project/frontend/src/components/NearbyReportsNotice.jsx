function NearbyReportsNotice({ reports, mergeInto, onMerge, onDismiss }) {
  if (!reports || reports.length === 0) return null;
  return (
    <div className="rounded-[10px] px-4 py-3 mt-4" style={{ backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
      <p className="font-inter font-bold text-sm" style={{ color: "#0D0B61" }}>
        Is this the same hazard?
      </p>
      <p className="font-inter text-xs mt-1 text-gray-700">
        Someone already reported something similar nearby. Adding your photo helps staff verify it faster.
      </p>
      <ul className="mt-2 space-y-2">
        {reports.map((r) => {
          const chosen = mergeInto === r.id;
          return (
            <li key={r.id} className="bg-white rounded-[10px] px-3 py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-inter font-semibold text-xs truncate">{r.title}</p>
                <p className="font-inter text-xs text-gray-600">
                  {r.distance_m} m away · {r.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onMerge(r.id)}
                className="shrink-0 rounded-full px-3 py-1.5 font-inter text-xs font-bold"
                style={{
                  border: "1px solid #042545",
                  backgroundColor: chosen ? "#042545" : "#FFFFFF",
                  color: chosen ? "#FFFFFF" : "#042545",
                }}
              >
                {chosen ? "Adding to this" : "Same hazard"}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={onDismiss} className="mt-2 font-inter text-xs underline text-gray-700">
        No, mine is different
      </button>
    </div>
  );
}

export default NearbyReportsNotice;