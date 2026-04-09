import { useEffect, useMemo } from 'react';
import useComplaintStore from '../stores/complaintStore';
import TopNavbar from '../components/TopNavbar';
import { calculatePriorityScore } from '../intelligence/priorityEngine';
const AREA_GRID = [
  'Sector 1', 'Sector 2', 'Old Town', 'Market Area', 'Station Road',
  'Ashok Nagar', 'Gandhi Nagar', 'Lake Area', 'Industrial Zone', 'Hospital Zone',
  'Bus Stand', 'Patel Colony', 'New Extension', 'Ring Road', 'Civil Lines',
  'Vijay Nagar', 'Sadar Bazar', 'University Area', 'Airport Road', 'Outer Ring',
  'Ram Nagar', 'Shiv Colony', 'West Zone', 'East Zone', 'North End',
  'South Camp', 'Central Park', 'River Bank', 'Tech Park', 'Heritage Zone',
  'Green Belt', 'Sports Complex', 'Residential A', 'Residential B', 'Slum Area',
];
export default function HeatmapPage() {
  const { complaints, subscribeAll } = useComplaintStore();
  useEffect(() => {
    const unsub = subscribeAll();
    return unsub;
  }, []);
  const areaMap = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const area = c.location?.area || 'Unknown';
      map[area] = (map[area] || 0) + 1;
    });
    return map;
  }, [complaints]);
  const maxCount = Math.max(...Object.values(areaMap), 1);
  const getIntensity = (count) => {
    if (!count) return 0;
    const ratio = count / maxCount;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };
  const hotspots = Object.entries(areaMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([area, count]) => ({ area, count }));
  const gridData = AREA_GRID.map(area => ({
    area,
    count: areaMap[area] || 0,
    intensity: getIntensity(areaMap[area] || 0),
  }));
  const categoryHotspots = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const area = c.location?.area || 'Unknown';
      const cat = c.category || 'other';
      if (!map[area]) map[area] = {};
      map[area][cat] = (map[area][cat] || 0) + 1;
    });
    return map;
  }, [complaints]);
  return (
    <>
      <TopNavbar
        title="Complaint Heatmap"
        subtitle={`Geographic density across ${Object.keys(areaMap).length} areas`}
      />
      <div className="page-content animate-fadeIn">
        <div className="grid-2 mb-6" style={{ gap: 20 }}>
          {}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Area Density Map</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Low</span>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: i === 0 ? 'var(--bg-elevated)' : `rgba(139, 92, 246, ${i * 0.2 + 0.1})` }} />
                ))}
                <span>High</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {gridData.map(cell => (
                <div
                  key={cell.area}
                  className={`heatmap-cell heatmap-${cell.intensity}`}
                  title={`${cell.area}: ${cell.count} complaints`}
                  style={{ position: 'relative' }}
                  onMouseEnter={e => {
                    const tip = e.currentTarget.querySelector('.heat-tip');
                    if (tip) tip.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    const tip = e.currentTarget.querySelector('.heat-tip');
                    if (tip) tip.style.opacity = '0';
                  }}
                >
                  {cell.count > 0 && (
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: cell.intensity >= 3 ? 'white' : 'rgba(255,255,255,0.5)',
                    }}>
                      {cell.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              💡 Hover over cells to see area names and complaint counts
            </div>
          </div>
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">🔥 Top Hotspot Areas</span></div>
              {hotspots.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No data yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hotspots.map((spot, i) => (
                    <div key={spot.area} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: i === 0 ? 'var(--red)' : i === 1 ? 'var(--orange)' : i === 2 ? 'var(--yellow)' : 'var(--text-muted)',
                        minWidth: 20,
                        textAlign: 'center',
                      }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{spot.area}</span>
                      <div className="score-bar" style={{ width: 80 }}>
                        <div className="score-fill" style={{ width: `${(spot.count / maxCount) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{spot.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {}
            {hotspots.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">Issue Types in Top Areas</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {hotspots.slice(0, 5).map(spot => {
                    const cats = categoryHotspots[spot.area] || {};
                    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <div key={spot.area} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, flex: 1, fontWeight: 500 }}>{spot.area}</span>
                        {topCat && <span className={`chip chip-${topCat[0]}`}>{topCat[0]}</span>}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{topCat?.[1] || 0} reports</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="card">
          <div className="card-header"><span className="card-title">All Areas – Complaint Count</span></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Total Complaints</th>
                <th>Intensity</th>
                <th>Density Bar</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(areaMap)
                .sort((a, b) => b[1] - a[1])
                .map(([area, count]) => {
                  const intensity = getIntensity(count);
                  const colors = ['var(--text-muted)', 'var(--green)', 'var(--yellow)', 'var(--orange)', 'var(--red)'];
                  return (
                    <tr key={area}>
                      <td style={{ fontWeight: 500 }}>📍 {area}</td>
                      <td style={{ fontWeight: 700 }}>{count}</td>
                      <td>
                        <span style={{ color: colors[intensity], fontWeight: 700, fontSize: 12 }}>
                          {['None', 'Low', 'Medium', 'High', 'Critical'][intensity]}
                        </span>
                      </td>
                      <td>
                        <div className="score-bar" style={{ maxWidth: 160 }}>
                          <div className="score-fill" style={{ width: `${(count / maxCount) * 100}%`, background: colors[intensity] }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
