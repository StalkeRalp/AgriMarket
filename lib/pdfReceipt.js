"use client";

export function generateReceiptPDF(order) {
  try {
    if (!order) throw new Error("Aucune donnée de commande valide.");

    const items = order.items || order.lines || [];
    const subtotalCalc = items.reduce((sum, item) => {
      const q = item.quantity || 1;
      const p = item.price || (item.product && item.product.price) || 0;
      return sum + q * p;
    }, 0);
    const shippingAmount = order.shipping !== undefined ? order.shipping : 2000;
    const finalTotal = order.total || (subtotalCalc + shippingAmount);

    const printWindow = window.open("", "_blank", "width=850,height=1000");
    if (!printWindow) {
      throw new Error("Le bloqueur de fenêtres surgissantes a empêché l'ouverture du reçu. Veuillez l'autoriser pour télécharger votre reçu.");
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Reçu de Commande - ${order.id} | AGRIMARKET</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a1412;
            margin: 0;
            padding: 24px;
            background: #fff;
          }
          .receipt-box {
            border: 2px solid #1a1412;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1a1412;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .brand-logo {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #33223c;
          }
          .brand-sub {
            font-size: 9px;
            letter-spacing: 0.25em;
            color: #8a7794;
            display: block;
            margin-top: 4px;
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
            letter-spacing: 0.08em;
            color: #1a1412;
          }
          .receipt-title p {
            font-size: 12px;
            color: #666;
            margin: 4px 0 0;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #faf8f5;
            border: 1px solid #e5dcd3;
            padding: 20px;
          }
          .meta-box h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #8c8278;
            margin: 0 0 8px;
          }
          .meta-box p {
            font-size: 13px;
            margin: 3px 0;
            line-height: 1.4;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background: #1a1412;
            color: #fff;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 12px;
            text-align: left;
          }
          .items-table td {
            padding: 14px 12px;
            border-bottom: 1px solid #e8e2db;
            font-size: 13px;
          }
          .totals-table {
            width: 50%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .totals-table td {
            padding: 8px 12px;
            font-size: 13px;
          }
          .totals-table tr.grand-total td {
            font-size: 17px;
            font-weight: 800;
            border-top: 2px solid #1a1412;
            color: #33223c;
            padding-top: 12px;
          }
          .footer {
            border-top: 1px solid #e5dcd3;
            padding-top: 18px;
            text-align: center;
            font-size: 11px;
            color: #777;
          }
          .btn-print {
            display: block;
            width: 100%;
            padding: 14px;
            background: #1a1412;
            color: #fff;
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .btn-print { display: none; }
            .receipt-box { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
        <div class="receipt-box">
          <div class="header">
            <div>
              <span class="brand-logo">AGRIMARKET</span>
              <span class="brand-sub">MARKETPLACE AGRICOLE & AGROPASTORAL</span>
            </div>
            <div class="receipt-title">
              <h1>REÇU DE COMMANDE</h1>
              <p><strong>N° ${order.id}</strong></p>
              <p>Date : ${new Date(order.createdAt || Date.now()).toLocaleDateString("fr-FR")} à ${new Date(order.createdAt || Date.now()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <h3>Informations Client & Contact</h3>
              <p><strong>Client :</strong> ${order.name || order.customer?.name || "Client AgriMarket"}</p>
              <p><strong>Téléphone :</strong> ${order.phone || order.customer?.phone || "Non renseigné"}</p>
              <p><strong>Email :</strong> ${order.email || order.customer?.email || "Non renseigné"}</p>
            </div>
            <div class="meta-box">
              <h3>Livraison & Règlement</h3>
              <p><strong>Ville :</strong> ${order.city || "Douala / Yaoundé"}</p>
              <p><strong>Quartier / Repère :</strong> ${order.district ? order.district + " - " : ""}${order.address || "Adresse enregistrée"}</p>
              <p><strong>Paiement :</strong> ${order.paymentMethod || order.payment || "Paiement Mobile / Cash"}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Désignation du Produit</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix Unitaire</th>
                <th style="text-align: right;">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              ${items.length > 0 ? items.map(item => {
                const name = item.name || (item.product && item.product.name) || "Produit agricole";
                const qty = item.quantity || 1;
                const unitPrice = item.price || (item.product && item.product.price) || 0;
                const sub = qty * unitPrice;
                return `
                  <tr>
                    <td><strong>${name}</strong></td>
                    <td style="text-align: center;">${qty}</td>
                    <td style="text-align: right;">${unitPrice.toLocaleString("fr-FR")} FCFA</td>
                    <td style="text-align: right;">${sub.toLocaleString("fr-FR")} FCFA</td>
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
              <td>Sous-total :</td>
              <td style="text-align: right;"><strong>${subtotalCalc.toLocaleString("fr-FR")} FCFA</strong></td>
            </tr>
            <tr>
              <td>Frais de livraison :</td>
              <td style="text-align: right;"><strong>${shippingAmount.toLocaleString("fr-FR")} FCFA</strong></td>
            </tr>
            <tr class="grand-total">
              <td>Total Général :</td>
              <td style="text-align: right;">${finalTotal.toLocaleString("fr-FR")} FCFA</td>
            </tr>
          </table>

          <div class="footer">
            <p><strong>AGRIMARKET</strong> — Solutions agricoles fiables et durables</p>
            <p>Assistance & Service Clientèle : +237 699 000 000 | contact@agrimarket.cm | www.agrimarket.cm</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Échec de la génération du reçu PDF : " + (err.message || "Une erreur est survenue."));
  }
}
