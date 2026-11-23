/* eslint-disable @next/next/no-img-element -- printed sheet: plain <img> keeps the PDF crisp */
import "./invoice-sheet.css";
import { dayParts, folioLabel, longDate, type DocData, type DocKind, type Pair } from "@/lib/invoiceDoc";

const filled = (rows: Pair[]) => rows.filter((r) => r.label.trim() || r.value.trim());
const mxn = (n: number) => n.toLocaleString("en-US");

function Rows({ rows }: { rows: Pair[] }) {
  return (
    <>
      {filled(rows).map((r, i) => (
        <div className="row" key={i}>
          <span>{r.label}</span>
          <span>{r.value || "—"}</span>
        </div>
      ))}
    </>
  );
}

export default function InvoiceSheet({ kind, folio, d, zoom }: { kind: DocKind; folio: number | null; d: DocData; zoom?: number }) {
  const invoice = kind === "invoice";
  const folioText = folioLabel(folio);
  const route = filled(d.route);
  const facts = filled(d.facts);
  const reservation = filled(d.reservation);
  const notes = d.notes.map((n) => n.trim()).filter(Boolean);
  const hasPayment = d.totalMXN > 0 || filled(d.payment).length > 0 || (invoice && d.status);
  const paid = d.status === "Paid" || d.status === "Confirmed";

  return (
    <div className="avdoc" style={zoom ? { zoom } : undefined}>
      <header>
        <img className="logo" src="/images/logo-invoice.png" alt="Amanah Vacations" />
        <div className="titles">
          <div className="eyebrow">Amanah Vacations</div>
          <h1>{invoice ? "Booking Confirmation" : "Quote & Itinerary"}</h1>
          <div className="ref">
            {invoice ? (
              <>Folio <b>{folioText}</b> &nbsp;·&nbsp; Issued <b>{longDate(d.issued)}</b></>
            ) : (
              <>Prepared <b>{longDate(d.issued)}</b></>
            )}
            <br />
            Playa del Carmen, Quintana Roo, Mexico
          </div>
        </div>
      </header>

      {d.greeting && <p className="greet">{d.greeting}</p>}

      <section className="ticket">
        <div className="photo"><img src="/images/logo-invoice.png" alt="" /></div>
        <div className="main">
          <div>
            {d.eyebrow && <div className="eyebrow">{d.eyebrow}</div>}
            <div className="service">{d.service || "—"}</div>
            {d.sub && <div className="sub">{d.sub}</div>}
          </div>
          {route.length > 0 && (
            <ol className="route">
              {route.map((r, i) => (
                <li key={i}><small>{r.label}</small>{r.value || "—"}</li>
              ))}
            </ol>
          )}
          {facts.length > 0 && (
            <div className={`facts${facts.length > 3 ? " many" : ""}`}>
              {facts.map((f, i) => (
                <div key={i}><small>{f.label}</small>{f.value || "—"}</div>
              ))}
            </div>
          )}
        </div>
        <div className="stub">
          <small>{d.stubLabel}</small>
          <div className="folio">{d.stubText || folioText}</div>
        </div>
        <i className="notch t" /><i className="notch b" />
      </section>

      {d.schedule.length > 0 && (
        <div className="sched">
          <h2>Your schedule</h2>
          {d.schedule.map((s, i) => {
            const p = dayParts(s.date);
            return (
              <div className="day" key={i}>
                <div className="when"><small>{p.wd}</small><b>{p.day}</b><small>{p.mon}</small></div>
                <div><h3>{s.title}</h3>{s.desc && <p>{s.desc}</p>}</div>
                <div className="dur">{s.durLabel && <small>{s.durLabel}</small>}{s.dur && <b>{s.dur}</b>}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid">
        {filled(d.guests).length > 0 && (
          <div><h2>Guests</h2><Rows rows={d.guests} /></div>
        )}
        {filled(d.pickup).length > 0 && (
          <div><h2>{d.pickupTitle || "Pick-up"}</h2><Rows rows={d.pickup} /></div>
        )}
        {hasPayment && (
          <div>
            <h2>{invoice ? "Payment" : "Price"}</h2>
            <div className="total">
              <span>Total</span>
              <span className="amount">{d.totalMXN > 0 ? <>{mxn(d.totalMXN)}<small>MXN</small></> : "FREE"}</span>
            </div>
            {d.totalUSD > 0 && <div className="row"><span>Total in USD</span><span>{mxn(d.totalUSD)} USD</span></div>}
            <Rows rows={d.payment} />
            {d.status && (
              <div className="row"><span>Status</span><span><b className={`pill${paid ? " ok" : ""}`}>{d.status}</b></span></div>
            )}
          </div>
        )}
        {reservation.length > 0 && (
          <div><h2>Your reservation</h2><Rows rows={reservation} /></div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="notes"><ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
      )}

      <div className="spacer" />
      <footer>
        <div className="brand">Amanah Vacations <i>Trust in Adventure</i></div>
        <div className="contact">
          <span>amanahvacations.com</span>
          <span>booking@amanahvacations.com</span>
          {!invoice && <span>+52 990 351 6948</span>}
        </div>
      </footer>
    </div>
  );
}
