---
version: 1
slug: "frontend-src-app-jsx"
primary_target: "frontend/src/App.jsx"
related_targets: ["frontend/src/pages/thong_ke/ThongKe.jsx","frontend/src/pages/dich_vu/DichVu.jsx","frontend/src/pages/dien_nuoc/DienNuoc.jsx","frontend/src/pages/hoa_don/HoaDon.jsx","frontend/src/pages/lich_xem/LichXem.jsx","frontend/src/pages/bang_tin/BangTin.jsx","frontend/src/pages/danh_gia_phong/DanhGiaPhong.jsx","frontend/src/pages/thong_bao/ThongBao.jsx"]
---

Operate surface. Audience: StaySync landlords handling recurring room, reading, billing, appointment and community work. Scope: the shared landlord shell and Hùng-owned pages; modules owned by members 2 and 3 remain integrations.

## Direction contract

THESIS: Make each room the unit of work: its tenant, utility reading, invoice state and balance stay together in one operator view. Refuse dashboard tiles that force the landlord to jump between rooms and modules to resolve one issue.

OWN-WORLD: Extend the supplied StaySync landlord screens: white workspace and sidebar, pale blue selected rows and backgrounds, navy table headings, blue links and primary controls, orange for high-priority actions, and restrained semantic status colors. Use one system sans, compact aligned tables, standard form controls, consistent line icons and 6–8px control corners.

STORY: The landlord selects a building, finds a room, sees who lives there and what is due, then opens the next useful action. The overview leads with exceptions; detail pages keep their task-specific filters and full tables. The interface never invents live financial or occupancy figures.

FIRST VIEWPORT: At desktop width, keep a 238px left navigation and a 68px utility bar. Place the page title, building selector, room search and primary action above a narrow summary strip. Give the room table roughly two thirds of the remaining width; keep the selected room’s reading, invoice, balance and action buttons visible in a fixed right detail panel. On narrow screens, collapse navigation and move details into a drawer.

FORM: Bàn điều phối theo phòng, the third dealt structure shown to the user; seed:3807faec7cf4b709. Its signature move is the selected room row opening a persistent detail panel, so one selection carries through reading, billing and collection work.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
