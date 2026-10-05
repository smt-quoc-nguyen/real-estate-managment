import { courseWeeks } from "./curriculum";
import type { GlossaryEntry } from "../types/glossary";
import type { DomainKey } from "../types/learning";

/**
 * Beginner-first overrides for the vocabulary that appears across many weeks.
 * These definitions deliberately favor a concrete mental picture over a
 * dictionary-style translation.
 */
export const coreGlossaryEntries: readonly GlossaryEntry[] = [
  {
    id: "core-concept",
    label: "Concept",
    vietnameseLabel: "Khái niệm nghiệp vụ",
    definition: "Một ý niệm có tên, nghĩa và rule rõ trong ngôn ngữ của người làm nghiệp vụ.",
    example: "Lease, Invoice và Work Order là ba concept khác nhau dù chúng có liên hệ với nhau.",
    aliases: ["concepts"],
  },
  {
    id: "core-relationship",
    label: "Relationship",
    vietnameseLabel: "Mối quan hệ giữa các khái niệm",
    definition: "Cách hai concept liên kết, tham chiếu, chứa hoặc tạo ra nhau trong domain map.",
    example: "Lease references Space; Lease Charge generates Charge Occurrence.",
    aliases: ["relationships"],
  },
  {
    id: "core-business-decision",
    label: "Business decision",
    vietnameseLabel: "Quyết định nghiệp vụ",
    definition: "Hành động mà một stakeholder có thể chọn sau khi hiểu dữ liệu hoặc metric.",
    example: "Occupancy giảm khiến leasing manager quyết định đổi giá hoặc tăng marketing.",
    aliases: ["business decisions"],
  },
  {
    id: "core-model",
    label: "Model",
    vietnameseLabel: "Mô hình biểu diễn",
    definition: "Cách đơn giản hóa domain thành các khái niệm, dữ liệu và behavior đủ để giải quyết một nhóm bài toán.",
    example: "Lease model cần term, party, space, charge và amendment; không chỉ là một bảng hợp đồng.",
    aliases: ["models", "software model"],
  },
  {
    id: "core-actor",
    label: "Actor",
    vietnameseLabel: "Vai trò tham gia",
    definition: "Người, nhóm hoặc hệ thống thực hiện hành động hay dùng kết quả trong một workflow.",
    example: "Tenant tạo Service Request; Facility Manager triage; Technician thực hiện Work Order.",
    aliases: ["actors"],
  },
  {
    id: "core-metric",
    label: "Metric",
    vietnameseLabel: "Chỉ số đo lường",
    definition: "Một phép đo có numerator, denominator, scope, thời gian và mục đích ra quyết định rõ ràng.",
    example: "Occupancy 80% chỉ có nghĩa khi biết đo theo m², desk hay revenue và trong kỳ nào.",
    aliases: ["metrics"],
  },
  {
    id: "core-edge-case",
    label: "Edge case",
    vietnameseLabel: "Tình huống biên hoặc ít gặp",
    definition: "Trường hợp không phải happy path nhưng có thể làm model sai nếu không được nêu và xử lý rõ.",
    example: "Lease amendment ký muộn nhưng có hiệu lực hồi tố là một edge case của billing.",
    aliases: ["edge cases"],
  },
  {
    id: "core-state",
    label: "State",
    vietnameseLabel: "Trạng thái",
    definition: "Tình trạng hiện tại của một object, quyết định hành động nào được phép tiếp theo.",
    example: "Booking ở Held có thể expire; Booking ở Completed thì không còn giữ capacity tương lai.",
    aliases: ["states"],
  },
  {
    id: "core-event",
    label: "Event",
    vietnameseLabel: "Sự kiện đã xảy ra",
    definition: "Một fact trong quá khứ làm state hoặc projection thay đổi và cần tên mang ý nghĩa nghiệp vụ.",
    example: "PaymentSettled là event; AllocatePayment là command yêu cầu thực hiện hành động.",
    aliases: ["events", "domain event", "domain events"],
  },
  {
    id: "core-domain",
    label: "Domain",
    vietnameseLabel: "Miền nghiệp vụ",
    definition: "Một nhóm vấn đề, thuật ngữ và quy tắc cùng phục vụ một trách nhiệm kinh doanh.",
    example: "Lease domain quản lý quyền thuê và điều khoản; Billing domain biến nghĩa vụ đến hạn thành hóa đơn.",
    aliases: ["business domain", "domains"],
  },
  {
    id: "core-bounded-context",
    label: "Bounded context",
    vietnameseLabel: "Ranh giới mô hình và ngôn ngữ",
    definition: "Phạm vi mà trong đó một thuật ngữ có đúng một nghĩa và một nhóm chịu trách nhiệm về dữ liệu, rule của nó.",
    example: "Space context sở hữu cấu trúc mặt bằng; Billing context chỉ tham chiếu spaceId, không tự sửa diện tích.",
    aliases: ["bounded contexts"],
  },
  {
    id: "core-abstraction",
    label: "Abstraction",
    vietnameseLabel: "Khái niệm trừu tượng chung",
    definition: "Rút ra đặc điểm chung cần thiết và tạm bỏ qua chi tiết chưa quan trọng cho bài toán hiện tại.",
    example: "Space là abstraction chung cho suite, room, desk và seat.",
  },
  {
    id: "core-taxonomy",
    label: "Taxonomy",
    vietnameseLabel: "Hệ thống phân loại",
    definition: "Cách sắp xếp các loại khái niệm theo quan hệ rõ ràng để mọi người dùng cùng một vocabulary.",
    example: "Occupancy được chia thành physical, economic, lease và revenue occupancy.",
  },
  {
    id: "core-generalization",
    label: "Generalization",
    vietnameseLabel: "Tổng quát hóa",
    definition: "Gom nhiều loại cụ thể có điểm chung thành một loại cha để tránh lặp model và rule.",
    example: "Desk và meeting room đều có thể tổng quát thành Bookable resource.",
  },
  {
    id: "core-polymorphism",
    label: "Polymorphism",
    vietnameseLabel: "Xử lý nhiều loại qua cùng giao diện",
    definition: "Code gọi cùng một contract nhưng từng loại cụ thể có thể thực hiện hành vi theo rule riêng.",
    example: "Cùng lệnh calculatePrice, desk tính theo ngày còn meeting room tính theo giờ.",
  },
  {
    id: "core-invariant",
    label: "Invariant",
    vietnameseLabel: "Điều luôn phải đúng",
    definition: "Ràng buộc không được phép bị phá vỡ dù dữ liệu đi qua trạng thái hay workflow nào.",
    example: "Tổng tiền allocation đang hiệu lực không được vượt số tiền payment đã settle.",
    aliases: ["invariants"],
  },
  {
    id: "core-lifecycle",
    label: "Lifecycle",
    vietnameseLabel: "Vòng đời trạng thái",
    definition: "Chuỗi trạng thái một đối tượng đi qua và sự kiện khiến nó chuyển từ trạng thái này sang trạng thái khác.",
    example: "Work Order đi từ Planned → Assigned → In progress → Completed → Closed.",
    aliases: ["life cycle"],
  },
  {
    id: "core-effective-dated",
    label: "Effective-dated",
    vietnameseLabel: "Có thời gian hiệu lực",
    definition: "Dữ liệu lưu khoảng thời gian nó đúng, thay vì sửa đè và làm mất lịch sử.",
    example: "Giá thuê 100 triệu hiệu lực đến 31/12; giá 105 triệu bắt đầu từ 01/01 năm sau.",
    aliases: ["effective dated", "effective period", "effective interval"],
  },
  {
    id: "core-projection",
    label: "Projection",
    vietnameseLabel: "Bản đọc được suy ra",
    definition: "Một view được tính từ facts hoặc events nguồn để phục vụ câu hỏi cụ thể; nó không thay thế dữ liệu gốc.",
    example: "Occupancy dashboard là projection từ availability và occupancy intervals.",
    aliases: ["projections"],
  },
  {
    id: "core-snapshot",
    label: "Snapshot",
    vietnameseLabel: "Ảnh chụp dữ liệu tại một thời điểm",
    definition: "Bản ghi giữ nguyên giá trị dùng tại một mốc để báo cáo hoặc chứng từ cũ không đổi theo dữ liệu hiện tại.",
    example: "Invoice line giữ snapshot mô tả, amount và tax tại ngày phát hành.",
    aliases: ["snapshots"],
  },
  {
    id: "core-reconciliation",
    label: "Reconciliation",
    vietnameseLabel: "Đối soát",
    definition: "Chứng minh tổng ở hai nguồn hoặc hai bước của dòng tiền khớp nhau, và giải thích phần chênh lệch.",
    example: "Payment phải bằng allocated + unapplied + refunded/reversed theo cùng policy.",
    aliases: ["reconcile", "reconciled", "reconciling"],
  },
  {
    id: "core-ledger",
    label: "Ledger",
    vietnameseLabel: "Sổ cái kế toán",
    definition: "Nơi lưu các bút toán debit/credit chính thức theo tài khoản, pháp nhân và kỳ kế toán.",
    example: "Tenant deposit vào Cash và Deposit Liability, không ghi thẳng vào Revenue.",
    aliases: ["accounting ledger"],
  },
  {
    id: "core-portfolio",
    label: "Portfolio",
    vietnameseLabel: "Danh mục bất động sản",
    definition: "Nhóm nhiều property hoặc investment asset để quản trị và báo cáo chung.",
    example: "Một quỹ có portfolio gồm ba tòa văn phòng tại TP.HCM và Hà Nội.",
    aliases: ["portfolios"],
  },
  {
    id: "core-property",
    label: "Property",
    vietnameseLabel: "Bất động sản hoặc phạm vi tài sản được quản lý",
    definition: "Đơn vị kinh doanh/pháp lý dùng để gom building, lease, chi phí và báo cáo; không phải lúc nào cũng đồng nghĩa một building.",
    example: "Một property có thể gồm hai tower cùng dùng chung bãi xe và báo cáo tài chính.",
    aliases: ["properties"],
  },
  {
    id: "core-building",
    label: "Building",
    vietnameseLabel: "Tòa nhà vật lý",
    definition: "Công trình vật lý chứa floor và space, có hệ thống kỹ thuật và hoạt động vận hành riêng.",
    example: "Building Alpha có 10 tầng và một hệ thống HVAC dùng chung.",
    aliases: ["buildings"],
  },
  {
    id: "core-floor",
    label: "Floor",
    vietnameseLabel: "Tầng",
    definition: "Một cấp trong physical space hierarchy, thường chứa suite, room hoặc common area.",
    example: "Floor 5 chứa Suite 5A và Suite 5B.",
    aliases: ["floors"],
  },
  {
    id: "core-space",
    label: "Space",
    vietnameseLabel: "Không gian có thể quản lý",
    definition: "Một vị trí vật lý có identity riêng để cho thuê, đặt chỗ, bảo trì hoặc đo sử dụng.",
    example: "Suite 5A là space cho lease; phòng Lotus là space cho booking.",
    aliases: ["spaces"],
  },
  {
    id: "core-unit",
    label: "Unit",
    vietnameseLabel: "Đơn vị mặt bằng",
    definition: "Tên gọi cho một phần mặt bằng được quản lý như một đơn vị; cần nói rõ nó là suite, room hay loại nào.",
    example: "Unit A có thể là văn phòng cho thuê, nhưng không nên dùng Unit để gọi cả desk và meeting room.",
    aliases: ["units"],
    domains: ["space"],
  },
  {
    id: "core-measurement-unit",
    label: "Measurement unit",
    vietnameseLabel: "Đơn vị đo lường",
    definition: "Đơn vị gắn với một đại lượng để con số có nghĩa, ví dụ m², desk-hour hoặc đồng/m²/tháng.",
    example: "Không cộng 20 desk với 300 m²; phải giữ measurement unit và conversion policy rõ ràng.",
    aliases: ["measurement units"],
    domains: ["space", "coworking", "flex-metrics"],
  },
  {
    id: "core-unit-price",
    label: "Unit price",
    vietnameseLabel: "Đơn giá",
    definition: "Mức giá cho một đơn vị hàng hóa, diện tích, thời gian hoặc dịch vụ đã xác định.",
    example: "500.000đ/m²/tháng là unit price; nhân với 200 m² mới ra charge amount của kỳ.",
    domains: ["billing-ar", "vendor-procurement", "budget-reporting", "flex-metrics"],
  },
  {
    id: "core-unit-economics",
    label: "Unit economics",
    vietnameseLabel: "Hiệu quả kinh tế trên một đơn vị",
    definition: "Cách đo revenue, cost và contribution trên cùng một đơn vị kinh tế như location, member hoặc workstation.",
    example: "So revenue và variable cost trên mỗi workstation-month để biết mở rộng supply có tạo contribution hay không.",
    domains: ["flex-metrics"],
  },
  {
    id: "core-room",
    label: "Room",
    vietnameseLabel: "Phòng",
    definition: "Một space có ranh giới vật lý, thường có capacity và có thể bookable hoặc serviceable.",
    example: "Meeting room Lotus chứa tối đa 10 người và đặt theo giờ.",
    aliases: ["rooms", "meeting room", "meeting rooms"],
  },
  {
    id: "core-desk",
    label: "Desk",
    vietnameseLabel: "Bàn làm việc",
    definition: "Resource làm việc cho một người; có thể được gán cố định hoặc đặt linh hoạt.",
    example: "Dedicated desk gán cho một member, còn hot desk được chọn khi đến.",
    aliases: ["desks"],
  },
  {
    id: "core-seat",
    label: "Seat",
    vietnameseLabel: "Chỗ ngồi",
    definition: "Đơn vị capacity cho một người; seat không nhất thiết có identity vật lý độc lập như desk.",
    example: "Phòng họp có quantity 1 nhưng capacity 10 seats.",
    aliases: ["seats"],
  },
  {
    id: "core-nla",
    label: "NLA",
    labelCaseSensitive: true,
    vietnameseLabel: "Diện tích cho thuê thuần",
    definition: "Phần diện tích đủ điều kiện đưa vào nguồn cung cho thuê theo một chuẩn đo đã công bố.",
    example: "Tổng NLA của các suite active là denominator cho occupancy theo diện tích.",
    aliases: ["Net Leasable Area", "Net Leaseable Area"],
  },
  {
    id: "core-gfa",
    label: "GFA",
    labelCaseSensitive: true,
    vietnameseLabel: "Tổng diện tích sàn",
    definition: "Diện tích sàn tổng thể theo chuẩn đo; thường bao gồm phần không thể trực tiếp cho thuê.",
    example: "GFA có thể gồm hành lang và khu kỹ thuật nên thường lớn hơn NLA.",
    aliases: ["Gross Floor Area"],
  },
  {
    id: "core-available",
    label: "Available",
    vietnameseLabel: "Đủ điều kiện đưa ra cung",
    definition: "Resource được phép đưa ra để lease, sell hoặc book trong thời gian đang xét.",
    example: "Suite trống nhưng đang renovation là vacant, chưa chắc available.",
  },
  {
    id: "core-vacant",
    label: "Vacant",
    vietnameseLabel: "Không có quyền chiếm dụng hiện hành",
    definition: "Space chưa bị lease, license hoặc assignment chiếm giữ tại thời điểm đang xét.",
    example: "Suite không có tenant là vacant dù chưa thể chào thuê vì đang sửa chữa.",
    aliases: ["vacancy"],
  },
  {
    id: "core-occupied",
    label: "Occupied",
    vietnameseLabel: "Đã có quyền sử dụng hoặc assignment",
    definition: "Space/resource đã được gắn với lease, license hoặc member; không khẳng định hôm nay có người thật sự hiện diện.",
    example: "Văn phòng đã thuê cả tháng vẫn occupied dù nhân viên làm việc tại nhà hôm nay.",
  },
  {
    id: "core-utilized",
    label: "Utilized",
    vietnameseLabel: "Được sử dụng thực tế",
    definition: "Có bằng chứng dùng thật trong khoảng đo, như check-in, sensor hoặc booking attended.",
    example: "36 desk assigned nhưng chỉ 12 desk có người dùng: occupied cao, utilized thấp.",
    aliases: ["utilization"],
  },
  {
    id: "core-tenant",
    label: "Tenant",
    vietnameseLabel: "Bên thuê",
    definition: "Cá nhân hoặc pháp nhân có vai trò bên thuê trong lease; có thể khác payer, occupant hoặc billing contact.",
    example: "Công ty mẹ ký lease nhưng công ty con là occupant và kế toán tập đoàn là payer.",
    aliases: ["tenants"],
  },
  {
    id: "core-lease",
    label: "Lease",
    vietnameseLabel: "Hợp đồng/quyền thuê",
    definition: "Thỏa thuận pháp lý cấp quyền sử dụng space trong một khoảng thời gian, kèm điều khoản và nghĩa vụ tài chính.",
    example: "Lease cấp quyền dùng Suite 5A từ 01/04 và quy định rent, deposit, escalation.",
    aliases: ["leases", "lease contract"],
  },
  {
    id: "core-base-rent",
    label: "Base rent",
    vietnameseLabel: "Tiền thuê cơ bản",
    definition: "Khoản rent chính trả cho quyền sử dụng mặt bằng, trước service charge, utilities và khoản bổ sung.",
    example: "200 m² × 500.000đ/m²/tháng tạo base rent 100 triệu/tháng.",
  },
  {
    id: "core-rent-free",
    label: "Rent-free period",
    vietnameseLabel: "Thời gian miễn tiền thuê",
    definition: "Khoảng lease đã có hiệu lực hoặc tenant đã nhận mặt bằng nhưng contract cho miễn một khoản rent xác định.",
    example: "Lease commence 01/04 nhưng base rent bắt đầu bill từ 01/05.",
    aliases: ["rent free", "rent-free"],
  },
  {
    id: "core-security-deposit",
    label: "Security deposit",
    vietnameseLabel: "Tiền đặt cọc bảo đảm",
    definition: "Tiền landlord giữ để bảo đảm nghĩa vụ; khi nhận thường là liability phải hoàn/cấn trừ, chưa phải revenue.",
    example: "Nhận deposit 300 triệu làm Cash tăng và Deposit Liability tăng.",
    aliases: ["deposit", "lease deposit"],
  },
  {
    id: "core-service-charge",
    label: "Service charge",
    vietnameseLabel: "Phí dịch vụ vận hành",
    definition: "Khoản tenant trả cho dịch vụ và chi phí vận hành chung theo điều khoản lease.",
    example: "Phí bảo vệ, vệ sinh và vận hành khu chung có thể được thu qua service charge.",
    aliases: ["service charges"],
  },
  {
    id: "core-cam",
    label: "CAM",
    labelCaseSensitive: true,
    vietnameseLabel: "Chi phí bảo trì/vận hành khu vực chung",
    definition: "Common Area Maintenance: nhóm chi phí chung đủ điều kiện được phân bổ và thu hồi từ tenant theo lease rule.",
    example: "Tenant trả estimate hàng tháng; cuối năm actual pool được đối soát để tạo debit hoặc credit true-up.",
    aliases: ["Common Area Maintenance"],
    caseSensitiveAliases: ["CAM recovery", "CAM recoveries"],
  },
  {
    id: "core-charge",
    label: "Charge",
    vietnameseLabel: "Nghĩa vụ phải tính tiền",
    definition: "Rule hoặc kết quả tính cho một khoản tenant/member phải trả; charge chưa nhất thiết là dòng invoice đã phát hành.",
    example: "Lease charge sinh charge occurrence tháng 4, sau đó billing mới đưa nó lên invoice.",
    aliases: ["charges"],
  },
  {
    id: "core-invoice",
    label: "Invoice",
    vietnameseLabel: "Hóa đơn/chứng từ yêu cầu thanh toán",
    definition: "Chứng từ đã phát hành cho customer, snapshot các dòng tiền, thuế và kỳ dịch vụ tại thời điểm issue.",
    example: "Một invoice 120 triệu có thể gồm base rent, parking và service charge.",
    aliases: ["invoices"],
  },
  {
    id: "core-ar",
    label: "AR",
    labelCaseSensitive: true,
    vietnameseLabel: "Khoản phải thu",
    definition: "Accounts Receivable: số tiền customer còn nợ doanh nghiệp sau khi nghĩa vụ được ghi nhận.",
    example: "Invoice 100 triệu, payment allocation 70 triệu thì AR open balance còn 30 triệu.",
    aliases: ["Accounts Receivable", "receivable", "receivables"],
  },
  {
    id: "core-ap",
    label: "AP",
    labelCaseSensitive: true,
    vietnameseLabel: "Khoản phải trả",
    definition: "Accounts Payable: số tiền doanh nghiệp còn phải trả vendor hoặc nhà cung cấp.",
    example: "Vendor invoice sửa HVAC đã duyệt tạo AP cho đến khi treasury thanh toán.",
    aliases: ["Accounts Payable", "payable", "payables"],
  },
  {
    id: "core-payment-allocation",
    label: "Payment allocation",
    vietnameseLabel: "Phân bổ tiền thanh toán",
    definition: "Quan hệ chỉ rõ bao nhiêu tiền từ một payment được dùng để settle open item nào.",
    example: "Payment 120 triệu được allocate 100 triệu vào invoice A và 20 triệu vào invoice B.",
    aliases: ["allocate payment", "payment allocations"],
  },
  {
    id: "core-credit-note",
    label: "Credit note",
    vietnameseLabel: "Chứng từ giảm công nợ",
    definition: "Chứng từ điều chỉnh làm giảm số tiền customer phải trả mà vẫn giữ nguyên invoice gốc để audit.",
    example: "Bill thừa 10 triệu thì phát hành credit note 10 triệu thay vì sửa invoice cũ.",
    aliases: ["credit notes"],
  },
  {
    id: "core-accrual",
    label: "Accrual",
    vietnameseLabel: "Dồn tích",
    definition: "Ghi revenue hoặc expense vào kỳ kinh tế nó phát sinh dù invoice hoặc cash chưa đến.",
    example: "Điện tháng 4 chưa nhận bill vẫn được accrue vào expense tháng 4.",
    aliases: ["accrued", "accruals"],
  },
  {
    id: "core-revenue",
    label: "Revenue",
    vietnameseLabel: "Doanh thu",
    definition: "Giá trị doanh nghiệp kiếm được từ hoạt động trong kỳ; thời điểm ghi nhận có thể khác lúc nhận cash.",
    example: "Deposit received là cash in nhưng chưa phải rent revenue.",
    aliases: ["revenues"],
  },
  {
    id: "core-expense",
    label: "Expense",
    vietnameseLabel: "Chi phí",
    definition: "Giá trị nguồn lực được tiêu dùng cho hoạt động trong kỳ; thời điểm ghi nhận có thể khác lúc trả cash.",
    example: "Utility expense tháng 4 được accrue dù vendor invoice đến tháng 5.",
    aliases: ["expenses"],
  },
  {
    id: "core-cash-flow",
    label: "Cash flow",
    vietnameseLabel: "Dòng tiền thực thu/chi",
    definition: "Sự thay đổi cash theo thời điểm tiền thật sự vào hoặc ra; không đồng nhất với revenue hay expense.",
    example: "Vay ngân hàng làm cash in nhưng không tạo operating revenue.",
    aliases: ["cashflow", "cash flows"],
  },
  {
    id: "core-opex",
    label: "OpEx",
    labelCaseSensitive: true,
    vietnameseLabel: "Chi phí vận hành",
    definition: "Operating Expense: chi phí thường xuyên để vận hành property và tạo revenue hiện tại.",
    example: "Cleaning, security và utilities thường là OpEx.",
    aliases: ["Operating Expense", "Operating Expenses"],
  },
  {
    id: "core-capex",
    label: "CapEx",
    labelCaseSensitive: true,
    vietnameseLabel: "Chi tiêu vốn",
    definition: "Capital Expenditure: khoản đầu tư tạo hoặc nâng cấp lợi ích dài hạn, thường được capitalise rồi phân bổ theo thời gian.",
    example: "Thay mới toàn bộ chiller có thể là CapEx; bảo dưỡng định kỳ thường là OpEx.",
    aliases: ["Capital Expenditure", "Capital Expenditures"],
  },
  {
    id: "core-noi",
    label: "NOI",
    labelCaseSensitive: true,
    vietnameseLabel: "Thu nhập vận hành ròng",
    definition: "Net Operating Income: operating revenue trừ operating expenses theo policy, trước financing, tax và thường trước depreciation.",
    example: "Revenue 10 tỷ và eligible OpEx 4 tỷ tạo NOI 6 tỷ.",
    aliases: ["Net Operating Income"],
  },
  {
    id: "core-cap-rate",
    label: "Cap rate",
    vietnameseLabel: "Tỷ suất vốn hóa",
    definition: "Capitalization rate dùng để liên hệ stabilized NOI với giá trị tài sản trong phương pháp direct capitalization.",
    example: "Stabilized NOI 6 tỷ / cap rate 8% cho indicated value khoảng 75 tỷ.",
    aliases: ["Capitalization rate"],
  },
  {
    id: "core-occupancy",
    label: "Occupancy",
    vietnameseLabel: "Mức chiếm dụng",
    definition: "Tỷ lệ nguồn cung được chiếm dụng theo một numerator, denominator, đơn vị và khoảng thời gian đã định nghĩa.",
    example: "150 m² occupied trên 200 m² available trong tháng tạo area occupancy 75%.",
  },
  {
    id: "core-work-order",
    label: "Work Order",
    vietnameseLabel: "Lệnh công việc",
    definition: "Bản ghi có thể lập kế hoạch, phân công và kiểm soát một công việc bảo trì cụ thể.",
    example: "Yêu cầu phòng quá nóng được triage rồi tạo Work Order kiểm tra AHU.",
    aliases: ["work orders"],
  },
  {
    id: "core-service-request",
    label: "Service Request",
    vietnameseLabel: "Yêu cầu dịch vụ",
    definition: "Mô tả nhu cầu hoặc sự cố do tenant/member báo; chưa phải kế hoạch thực hiện công việc.",
    example: "Tenant báo đèn hỏng là Service Request; kỹ thuật tạo Work Order để sửa.",
    aliases: ["service requests"],
  },
  {
    id: "core-sla",
    label: "SLA",
    labelCaseSensitive: true,
    vietnameseLabel: "Cam kết mức dịch vụ",
    definition: "Service Level Agreement: quy tắc cam kết về thời gian phản hồi, xử lý hoặc chất lượng dịch vụ.",
    example: "Sự cố khẩn cấp phải được phản hồi trong 15 phút theo SLA.",
    aliases: ["Service Level Agreement"],
  },
  {
    id: "core-vendor",
    label: "Vendor",
    vietnameseLabel: "Nhà cung cấp",
    definition: "Bên ngoài cung cấp hàng hóa hoặc dịch vụ cho property theo contract, PO hoặc work order.",
    example: "Vendor HVAC thực hiện bảo trì chiller theo service contract.",
    aliases: ["vendors", "supplier", "suppliers"],
  },
  {
    id: "core-procurement",
    label: "Procurement",
    vietnameseLabel: "Mua sắm",
    definition: "Quy trình từ nhu cầu mua, phê duyệt, chọn vendor, đặt hàng, nhận hàng/dịch vụ đến thanh toán.",
    example: "Purchase Requisition → Purchase Order → Receipt → Vendor Invoice → Payment.",
  },
  {
    id: "core-budget",
    label: "Budget",
    vietnameseLabel: "Ngân sách",
    definition: "Kế hoạch tài chính đã được phê duyệt cho một kỳ, scenario và version xác định.",
    example: "Budget utilities năm 2027 là 1,2 tỷ; actual được so với đúng version đã phê duyệt.",
    aliases: ["budgets"],
  },
  {
    id: "core-actual",
    label: "Actual",
    vietnameseLabel: "Số thực tế đã phát sinh",
    definition: "Số liệu đã ghi nhận từ giao dịch hoặc ledger, khác budget và forecast.",
    example: "Budget cleaning tháng 4 là 100 triệu, actual ledger là 110 triệu.",
    aliases: ["actuals"],
    domains: ["budget-reporting"],
  },
  {
    id: "core-actual-use",
    label: "Actual use",
    vietnameseLabel: "Mức sử dụng thực tế",
    definition: "Việc resource thật sự được sử dụng, dựa trên evidence như check-in, access log hoặc sensor; khác quyền đã bán hay booking đã giữ chỗ.",
    example: "Phòng đã booking 2 giờ nhưng chỉ có người trong 60 phút: booked time và actual use không bằng nhau.",
    aliases: ["actual presence"],
    domains: ["space", "occupancy", "coworking", "flex-metrics"],
  },
  {
    id: "core-variance",
    label: "Variance",
    vietnameseLabel: "Chênh lệch",
    definition: "Khoảng khác nhau giữa actual và mốc so sánh như budget hoặc forecast, cần phân rã nguyên nhân.",
    example: "Expense variance +10 triệu có thể do giá tăng, volume tăng hoặc timing lệch.",
    aliases: ["variances"],
  },
  {
    id: "core-asset",
    label: "Asset",
    vietnameseLabel: "Tài sản — cần đọc theo context",
    definition: "Trong Facility, asset thường là equipment cần bảo trì; trong Investment, asset thường là property tạo dòng tiền và giá trị.",
    example: "Chiller là maintainable asset; tòa Alpha là investment asset.",
    aliases: ["assets"],
    domains: ["facility", "asset-investor"],
  },
  {
    id: "core-property-management",
    label: "Property Management",
    vietnameseLabel: "Quản lý vận hành bất động sản",
    definition: "Chức năng điều hành property hằng ngày: tenant, lease, billing, collection, service, vendor, budget và báo cáo vận hành.",
    example: "Property Management theo dõi thu tiền thuê, xử lý yêu cầu tenant và kiểm soát chi phí tòa nhà.",
    aliases: ["Property Manager"],
    domains: ["asset-investor"],
  },
  {
    id: "core-asset-management",
    label: "Asset Management",
    vietnameseLabel: "Quản lý chiến lược giá trị tài sản",
    definition: "Chức năng tối ưu business plan, leasing strategy, CapEx, valuation, financing và thời điểm exit của property.",
    example: "Asset Manager quyết định nâng cấp 20 tỷ nếu NOI và giá trị tài sản kỳ vọng bù được vốn bỏ ra.",
    aliases: ["Asset Manager"],
    domains: ["asset-investor"],
  },
  {
    id: "core-investor",
    label: "Investor",
    vietnameseLabel: "Nhà đầu tư",
    definition: "Bên góp vốn và quan tâm cash flow, risk, asset value và investment return của phần sở hữu.",
    example: "Investor xem distribution, residual NAV, IRR và equity multiple thay vì toàn bộ transaction ledger.",
    aliases: ["investors"],
  },
  {
    id: "core-irr",
    label: "IRR",
    labelCaseSensitive: true,
    vietnameseLabel: "Tỷ suất hoàn vốn nội bộ",
    definition: "Internal Rate of Return: tỷ lệ chiết khấu làm giá trị hiện tại ròng của chuỗi cash flow theo ngày bằng 0.",
    example: "Góp vốn hôm nay và nhận phân phối ở các ngày khác nhau; IRR phản ánh cả amount lẫn timing.",
    aliases: ["Internal Rate of Return"],
  },
  {
    id: "core-member",
    label: "Member",
    vietnameseLabel: "Người dùng thành viên",
    definition: "Một người có identity để truy cập và sử dụng dịch vụ coworking; member không nhất thiết là account trả tiền hoặc bản thân membership contract.",
    example: "Acme là account trả tiền cho 20 member; mỗi member có access identity riêng nhưng cùng dùng entitlement của công ty.",
    aliases: ["members"],
    domains: ["coworking", "flex-metrics"],
  },
  {
    id: "core-membership",
    label: "Membership",
    vietnameseLabel: "Quan hệ đăng ký thành viên có thời hạn",
    definition: "Quan hệ subscription/contract nối account hoặc member với một PlanVersion, term, billing cadence và status; quyền runtime được cấp qua Entitlement riêng.",
    example: "Membership nối account/member với PlanVersion; các quyền dùng 10 hot desks và 40 room credits được sinh thành EntitlementGrant riêng.",
    aliases: ["memberships"],
  },
  {
    id: "core-entitlement",
    label: "Entitlement",
    vietnameseLabel: "Quyền được sử dụng",
    definition: "Quyền runtime cụ thể mà member được phép dùng, có scope, quantity và thời gian hiệu lực.",
    example: "Plan cho member quyền vào location A và đặt tối đa 10 giờ meeting room.",
    aliases: ["entitlements"],
  },
  {
    id: "core-booking",
    label: "Booking",
    vietnameseLabel: "Đặt chỗ",
    definition: "Reservation giữ hoặc cam kết một resource/capacity trong một khoảng thời gian.",
    example: "Member giữ Room Lotus 14:00–15:00; hold chỉ trở thành confirmed khi authorization thành công.",
    aliases: ["bookings", "reservation", "reservations"],
  },
  {
    id: "core-credit",
    label: "Credit",
    vietnameseLabel: "Đơn vị quyền tiêu dùng",
    definition: "Đơn vị không nhất thiết là tiền, dùng để cấp, giữ và tiêu quyền sử dụng dịch vụ coworking.",
    example: "Đặt phòng 2 giờ consume 4 room credits; hủy đúng hạn tạo release entry.",
    aliases: ["credits"],
    domains: ["coworking"],
  },
  {
    id: "core-mrr",
    label: "MRR",
    labelCaseSensitive: true,
    vietnameseLabel: "Doanh thu định kỳ hàng tháng chuẩn hóa",
    definition: "Monthly Recurring Revenue: phần recurring revenue được quy đổi về một tháng theo contract đang active.",
    example: "Gói 120 triệu/năm đóng góp 10 triệu MRR mỗi tháng nếu policy phân bổ đều.",
    aliases: ["Monthly Recurring Revenue"],
  },
  {
    id: "core-revpaw",
    label: "RevPAW",
    labelCaseSensitive: true,
    vietnameseLabel: "Doanh thu trên mỗi workstation khả dụng",
    definition: "Revenue Per Available Workstation: eligible revenue chia cho số workstation khả dụng trong cùng scope và kỳ.",
    example: "Revenue 300 triệu / 100 available workstation = 3 triệu RevPAW.",
  },
  {
    id: "core-booking-revenue-resource-hour",
    label: "Booking Revenue per Available Resource-Hour",
    vietnameseLabel: "Doanh thu booking trên mỗi giờ-tài-nguyên khả dụng",
    definition: "Custom flex metric: eligible booking revenue chia cho số resource-hour có thể bán trong cùng scope và kỳ.",
    example: "Meeting room mở bán 8 giờ là 8 available room-hours, bất kể trong phòng có bao nhiêu ghế.",
    domains: ["flex-metrics"],
  },
];

const normalizeAlias = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");

const containsUppercaseAcronym = (value: string) => /\b[A-Z]{2,}[A-Za-z0-9]*\b/.test(value);

/**
 * Every curriculum Concept becomes a glossary fallback. Curated entries win
 * alias ownership, so common beginner terms receive the shortest explanation
 * while long-tail concepts still have their authoritative Vietnamese definition.
 */
function createCurriculumGlossaryEntries(): GlossaryEntry[] {
  const claimedAliases = new Map<string, Array<readonly DomainKey[] | undefined>>();
  const scopesOverlap = (
    left: readonly DomainKey[] | undefined,
    right: readonly DomainKey[] | undefined,
  ) => !left?.length || !right?.length || left.some((domain) => right.includes(domain));
  const isClaimedInScope = (alias: string, domains: readonly DomainKey[] | undefined) =>
    claimedAliases
      .get(normalizeAlias(alias))
      ?.some((claimedDomains) => scopesOverlap(claimedDomains, domains)) ?? false;
  const claimAlias = (alias: string, domains: readonly DomainKey[] | undefined) => {
    const normalized = normalizeAlias(alias);
    const claims = claimedAliases.get(normalized) ?? [];
    claims.push(domains);
    claimedAliases.set(normalized, claims);
  };

  for (const entry of coreGlossaryEntries) {
    [entry.label, ...(entry.aliases ?? []), ...(entry.caseSensitiveAliases ?? [])].forEach((alias) =>
      claimAlias(alias, entry.domains),
    );
  }

  const entries: GlossaryEntry[] = [];
  for (const week of courseWeeks) {
    for (const lesson of week.lessons) {
      for (const concept of lesson.concepts) {
        const conceptDomains = [week.domain] as const;
        if (isClaimedInScope(concept.term, conceptDomains)) continue;

        // Only explicit variant names become aliases. Splitting compound terms
        // such as "Logo/member/revenue retention" creates dangerously generic
        // aliases (for example "member") with the wrong definition.
        const rawAliases = concept.variants?.map((variant) => variant.name) ?? [];
        const availableAliases = rawAliases.filter((alias) => {
          if (!normalizeAlias(alias) || isClaimedInScope(alias, conceptDomains)) return false;
          claimAlias(alias, conceptDomains);
          return true;
        });
        const aliases = availableAliases.filter((alias) => !containsUppercaseAcronym(alias));
        const caseSensitiveAliases = availableAliases.filter(containsUppercaseAcronym);

        claimAlias(concept.term, conceptDomains);
        entries.push({
          id: `concept-${concept.id}`,
          label: concept.term,
          definition: concept.definition,
          aliases,
          caseSensitiveAliases,
          domains: [week.domain],
          labelCaseSensitive: containsUppercaseAcronym(concept.term),
        });
      }
    }
  }
  return entries;
}

export const glossaryEntries: readonly GlossaryEntry[] = [
  ...coreGlossaryEntries,
  ...createCurriculumGlossaryEntries(),
];

export const glossaryById = new Map(glossaryEntries.map((entry) => [entry.id, entry] as const));

const glossaryEntriesByDomain = new Map<DomainKey, readonly GlossaryEntry[]>();

export function getGlossaryEntriesForDomain(domain: DomainKey): readonly GlossaryEntry[] {
  const cached = glossaryEntriesByDomain.get(domain);
  if (cached) return cached;

  const scopedEntries = glossaryEntries.filter(
    (entry) => !entry.domains?.length || entry.domains.includes(domain),
  );
  glossaryEntriesByDomain.set(domain, scopedEntries);
  return scopedEntries;
}
