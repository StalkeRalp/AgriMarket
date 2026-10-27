"use client";

export function generateReceiptPDF(order) {
  if (!order) throw new Error("Aucune donnée de commande valide.");

  const items = order.items || order.lines || [];
  const subtotalCalc = items.reduce((sum, item) => {
    const q = item.quantity || 1;
    const p = item.price || (item.product && item.product.price) || 0;
    return sum + q * p;
  }, 0);
  const shippingAmount = order.shipping !== undefined ? order.shipping : 0;
  const finalTotal = order.total || (subtotalCalc + shippingAmount);

  const printWindow = window.open("", "_blank", "width=850,height=1000");
  if (!printWindow) {
    throw new Error("Le bloqueur de fenêtres surgissantes a empêché l'ouverture du reçu. Veuillez autoriser les pop-ups pour imprimer votre reçu.");
  }

  const deliveryModeText = order.deliveryMode === "RETRAIT_RELAIS" 
    ? "Retrait en point relais / coopérative"
    : "Livraison à domicile / exploitation";

  const customerWhatsapp = order.whatsapp || order.customer?.whatsapp || order.phone || order.customer?.phone || "Non renseigné";
  const customerPhone = order.phone || order.customer?.phone || "Non renseigné";

  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Reçu Officiel - ${order.id} | AGRIMARKET CAMEROUN</title>
      <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          color: #1a221e;
          margin: 0;
          padding: 24px;
          background: #fff;
        }
        .receipt-box {
          border: 2px solid #0b5d33;
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0b5d33;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .brand-logo {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #0b5d33;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .brand-logo span.orange-mark {
          color: #f37021;
        }
        .brand-sub {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #59655e;
          display: block;
          margin-top: 5px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .receipt-title {
          text-align: right;
        }
        .receipt-title h1 {
          font-size: 20px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #07331e;
        }
        .receipt-title .order-ref {
          font-size: 15px;
          font-weight: 800;
          color: #0b5d33;
          margin: 4px 0;
        }
        .receipt-title p {
          font-size: 12px;
          color: #59655e;
          margin: 2px 0 0;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
          background: #f8faf9;
          border: 1px solid #d1dcd5;
          padding: 20px;
        }
        .meta-box h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #0b5d33;
          margin: 0 0 10px;
          font-weight: 800;
          border-bottom: 1px solid #e2ece7;
          padding-bottom: 4px;
        }
        .meta-box p {
          font-size: 13px;
          margin: 4px 0;
          line-height: 1.4;
          color: #2d3b33;
        }
        .meta-box strong {
          color: #07331e;
        }
        .badge-status {
          display: inline-block;
          background: #0b5d33;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-status.pending {
          background: #f37021;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .items-table th {
          background: #07331e;
          color: #ffffff;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 10px 12px;
          text-align: left;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2ece7;
          font-size: 13px;
        }
        .totals-table {
          width: 55%;
          margin-left: auto;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .totals-table td {
          padding: 8px 12px;
          font-size: 13px;
          color: #2d3b33;
        }
        .totals-table tr.grand-total td {
          font-size: 18px;
          font-weight: 900;
          border-top: 2px solid #0b5d33;
          color: #07331e;
          padding-top: 12px;
        }
        .footer {
          border-top: 1px solid #d1dcd5;
          padding-top: 18px;
          text-align: center;
          font-size: 11px;
          color: #59655e;
          line-height: 1.5;
        }
        .btn-print {
          display: block;
          width: 100%;
          padding: 14px;
          background: #0b5d33;
          color: #fff;
          text-align: center;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: none;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .btn-print:hover {
          background: #f37021;
        }
        @media print {
          .btn-print { display: none; }
          .receipt-box { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">Imprimer / Télécharger en PDF</button>
      <div class="receipt-box">
        <div class="header">
          <div>
            <div class="brand-logo">AGRI<span class="orange-mark">MARKET</span></div>
            <span class="brand-sub">La Marketplace Agropastorale du Cameroun</span>
          </div>
          <div class="receipt-title">
            <h1>Bordereau & Reçu</h1>
            <p class="order-ref">N° ${order.id}</p>
            <p>Émis le : ${new Date(order.createdAt || Date.now()).toLocaleDateString("fr-FR")} à ${new Date(order.createdAt || Date.now()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <h3>Informations Client & Contact</h3>
            <p><strong>Destinataire :</strong> ${order.name || order.customer?.name || "Client AgriMarket"}</p>
            <p><strong>Numéro d'appel :</strong> ${customerPhone}</p>
            <p><strong>Numéro WhatsApp :</strong> ${customerWhatsapp}</p>
            <p><strong>Email :</strong> ${order.email || order.customer?.email || "Non renseigné"}</p>
          </div>
          <div class="meta-box">
            <h3>Mode de Réception & Règlement</h3>
            <p><strong>Option :</strong> ${deliveryModeText}</p>
            <p><strong>Destination :</strong> ${order.city || "Douala / Yaoundé"} (${order.region || "Cameroun"})</p>
            <p><strong>Adresse / Point de retrait :</strong> ${order.pickupPoint ? order.pickupPoint : (order.district ? order.district + " - " : "") + (order.address || "Adresse renseignée")}</p>
            <p><strong>Moyen de règlement :</strong> ${order.paymentMethod || order.payment || "Mobile Money"}</p>
            <p><strong>Statut :</strong> <span class="badge-status ${order.status === 'En attente de paiement' ? 'pending' : ''}">${order.paymentStatus || order.status || 'Confirmée'}</span></p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Désignation du Produit Agropastoral</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix Unitaire</th>
              <th style="text-align: right;">Total Ligne</th>
            </tr>
          </thead>
          <tbody>
            ${items.length > 0 ? items.map(item => {
              const name = item.name || (item.product && item.product.name) || "Produit du terroir";
              const qty = item.quantity || 1;
              const unitPrice = item.price || (item.product && item.product.price) || 0;
              const sub = qty * unitPrice;
              const unit = item.unit || "unité";
              return `
                <tr>
                  <td>
                    <strong>${name}</strong>
                    ${item.origin ? `<br><small style="color:#59655e">Origine : ${item.origin}</small>` : ''}
                  </td>
                  <td style="text-align: center;">${qty} (${unit})</td>
                  <td style="text-align: right;">${unitPrice.toLocaleString("fr-FR")} FCFA</td>
                  <td style="text-align: right;"><strong>${sub.toLocaleString("fr-FR")} FCFA</strong></td>
                </tr>
              `;
            }).join("") : `
              <tr>
                <td colspan="4" style="text-align: center;">Articles enregistrés sur la commande ${order.id}</td>
              </tr>
            `}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Sous-total produits :</td>
            <td style="text-align: right;"><strong>${subtotalCalc.toLocaleString("fr-FR")} FCFA</strong></td>
          </tr>
          <tr>
            <td>Frais de livraison / acheminement :</td>
            <td style="text-align: right;"><strong>${shippingAmount === 0 ? "Gratuit (0 FCFA)" : shippingAmount.toLocaleString("fr-FR") + " FCFA"}</strong></td>
          </tr>
          <tr class="grand-total">
            <td>Montant Total Net :</td>
            <td style="text-align: right;">${finalTotal.toLocaleString("fr-FR")} FCFA</td>
          </tr>
        </table>

        <div class="footer">
          <p><strong>AGRIMARKET CAMEROUN</strong> — Plateforme Numérique de Distribution Agropastorale Directe Producteur-Consommateur</p>
          <p>Service Client & Support WhatsApp : <strong>+237 699 000 000</strong> | contact@agrimarket.cm | www.agrimarket.cm</p>
          <p>Merci de soutenir les producteurs et éleveurs du Cameroun.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}
