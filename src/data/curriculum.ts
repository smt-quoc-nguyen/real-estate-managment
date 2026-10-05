import type {
  Course,
  LearningRelation,
  LearningWeek,
  Lesson,
  RelationNode,
} from "../types/learning";
import { relationNodeCatalog } from "./relation-node-catalog";

type RelationDraft = Omit<LearningRelation, "id" | "fromId" | "toId"> &
  Partial<Pick<LearningRelation, "id">>;
type LessonDraft = Omit<Lesson, "relations"> & { relations: RelationDraft[] };

const relationNodeByLabel = new Map<string, RelationNode>(
  relationNodeCatalog.map((node) => [node.label, node] as const),
);

const resolveRelationNode = (label: string): RelationNode => {
  const node = relationNodeByLabel.get(label);
  if (!node) {
    throw new Error(`Unknown relation node "${label}". Add it to relation-node-catalog.ts first.`);
  }
  return node;
};

const defineLesson = (value: LessonDraft): Lesson => ({
  ...value,
  relations: value.relations.map((relation) => {
    const fromId = resolveRelationNode(relation.from).id;
    const toId = resolveRelationNode(relation.to).id;
    return {
      ...relation,
      id: relation.id ?? `${value.id}:${fromId}:${relation.kind}:${toId}`,
      fromId,
      toId,
    };
  }),
});
const defineWeek = (value: LearningWeek): LearningWeek => value;

export const curriculum = {
  id: "property-domain-academy",
  title: "PropertyOS Academy",
  description:
    "Lộ trình 12 tuần giúp Product Engineer xây mental model cho office building, commercial property và coworking theo vòng lặp business domain → actors → lifecycle → money flow → metrics → software model.",
  audience: "Product Engineer, Software Engineer, Business Analyst và Product Manager đang xây Property Management Software.",
  outcome:
    "Có thể phân rã requirement thành bounded context, nhận ra các khái niệm dễ bị trộn, thiết kế model có tính thời gian và giải thích được metric cho đúng stakeholder.",
  totalWeeks: 12,
  learningLoop: [
    "Concept — định nghĩa đúng ngôn ngữ nghiệp vụ",
    "Taxonomy — phân loại các biến thể",
    "Relationship — nối concept vào domain map",
    "Invariant — nêu điều luôn phải đúng",
    "Lifecycle — mô tả trạng thái và sự kiện",
    "Business decision — metric này giúp ai quyết định gì",
    "Software model — biểu diễn mà không khóa cứng tương lai",
  ],
  modules: [
    {
      id: "commercial-foundation",
      title: "Phase 1 · Commercial Property Foundation",
      description: "Xây nền space, lease và money flow trước khi tối ưu vận hành.",
      weekIds: ["week-01", "week-02", "week-03", "week-04"],
    },
    {
      id: "operations",
      title: "Phase 2 · Operations",
      description: "Đo hiệu suất sử dụng, vận hành tòa nhà và kiểm soát chi phí.",
      weekIds: ["week-05", "week-06", "week-07", "week-08"],
    },
    {
      id: "investment-flex",
      title: "Phase 3 · Investment & Flex",
      description: "Nâng góc nhìn lên asset/investor, sau đó áp dụng vào mô hình coworking linh hoạt.",
      weekIds: ["week-09", "week-10", "week-11", "week-12"],
    },
  ],
  weeks: [
    defineWeek({
      id: "week-01",
      number: 1,
      domain: "space",
      title: "Property, Building & Space Taxonomy",
      subtitle: "Vẽ bản đồ cái gì tồn tại trước khi gắn hợp đồng hay tiền vào đó",
      estimatedHours: 5,
      learningObjectives: [
        "Phân biệt Portfolio, Property, Building, Floor và Space theo trách nhiệm nghiệp vụ.",
        "Mô hình hóa capability leaseable, bookable, serviceable độc lập với loại vật lý.",
        "Giải thích chính xác available, vacant, occupied và utilized.",
        "Xử lý split/merge, diện tích, sức chứa và hiệu lực theo thời gian.",
      ],
      why:
        "Lease, booking, maintenance, occupancy và revenue đều tham chiếu space. Nếu space model sai, mọi domain phía sau sẽ dùng ID, status và metric mâu thuẫn nhau.",
      lessons: [
        defineLesson({
          id: "w01-l01",
          title: "Tại sao Space là foundation?",
          durationMinutes: 55,
          summary: "Hầu hết domain khác đều tham chiếu vào Space; hãy tổ chức location hierarchy mà không nhầm containment vật lý với ownership hay reporting.",
          why:
            "Một cây location duy nhất thường không đủ: cùng một building có thể thuộc một property pháp lý, một portfolio đầu tư và nhiều reporting group khác nhau.",
          concepts: [
            {
              id: "space-hierarchy",
              term: "Space hierarchy",
              definition: "Ba graph hiệu lực theo thời gian cần tách riêng: physical containment (Site → Building → Floor → Space), legal/ownership (Property, Parcel, OwnershipInterest ↔ Building) và reporting membership (Portfolio ↔ ReportingAsset). Room, Unit, Desk và Seat là specialization của Space trong graph vật lý.",
              why: "Tạo vocabulary chung mà không biến reporting group hay legal scope thành parent vật lý giả.",
              actors: ["Property manager", "Leasing team", "Facility manager"],
              commonMistake: "Dùng Unit như tên gọi chung cho cả office, meeting room và desk rồi nhét mọi thuộc tính vào một bảng.",
            },
            {
              id: "atomic-space",
              term: "Atomic space",
              definition: "Phần tử nhỏ nhất được một use case cụ thể phân bổ độc lập, ví dụ suite cho lease hoặc seat cho booking.",
              why: "Ranh giới atomic thay đổi theo use case; điều này quyết định granularity của availability và revenue.",
              actors: ["Product engineer", "Space planner"],
            },
          ],
          examples: [
            {
              title: "Tòa nhà Alpha",
              context: "Một property có hai tower, mỗi tower 10 tầng.",
              scenario: "Tầng 5 Tower A gồm Suite 5A 300 m², Suite 5B 200 m²; Suite 5A có 36 desk và hai meeting room.",
              outcome: "Lease tham chiếu Suite 5A; booking tham chiếu desk/meeting room; work order có thể tham chiếu cả Suite 5A hoặc điều hòa AHU của tầng.",
              numbers: ["500 m² total suite area (NLA theo cùng chuẩn đo)", "36 desk", "2 meeting room"],
            },
          ],
          relations: [
            { from: "Site", to: "Building", kind: "contains", explanation: "Physical containment dùng để điều hướng location và roll-up spatial data." },
            { from: "OwnershipInterest", to: "Building", kind: "references", explanation: "Legal/ownership graph độc lập với physical parent." },
            { from: "Portfolio", to: "ReportingAsset", kind: "references", explanation: "Reporting membership có thể thay đổi mà không di chuyển building." },
            { from: "Floor", to: "Space", kind: "contains", explanation: "Containment cho phép roll-up area và điều hướng location." },
            { from: "Lease", to: "Space", kind: "references", explanation: "Lease cấp quyền sử dụng, không sở hữu bản ghi space." },
          ],
          invariants: [
            "Một space chỉ có tối đa một parent vật lý tại cùng một thời điểm.",
            "Tổng diện tích con không được vượt diện tích phân bổ được của parent nếu cùng dùng một chuẩn đo.",
          ],
          lifecycle: [
            { state: "Planned", trigger: "Space plan được duyệt", businessMeaning: "Có thể dự báo nhưng chưa giao dịch." },
            { state: "Active", trigger: "Bàn giao vào vận hành", businessMeaning: "Có thể lease/book/service tùy capability." },
            { state: "Retired", trigger: "Phá bỏ hoặc merge", businessMeaning: "Giữ lịch sử nhưng không tạo giao dịch mới." },
          ],
          metrics: [
            { name: "Net leasable area (NLA)", formula: "Σ area của space leaseable đang active", interpretation: "Nguồn cung diện tích có thể tạo rent.", decision: "Leasing team dùng để lập inventory.", caution: "Không cộng desk area vào suite area lần nữa." },
          ],
          edgeCases: [
            { case: "Một building đi qua ranh giới hai parcel", risk: "Ép property = building làm sai ownership/reporting.", handling: "Tách physical containment khỏi legal ownership bằng relation có hiệu lực thời gian." },
          ],
          softwareModels: [
            {
              title: "Space là generalization, loại cụ thể là polymorphism",
              language: "typescript",
              code: `type PhysicalSpaceKind = "site" | "building" | "floor" | "suite" | "room" | "desk" | "seat";

interface Space {
  id: string;
  kind: PhysicalSpaceKind;
  physicalParentId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface ContextMembership {
  context: "ownership" | "reporting";
  subjectId: string;
  groupId: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface AreaMeasurement {
  spaceId: string;
  standard: "NLA" | "GFA" | "usable";
  valueM2: number;
}`,
              explanation: "Core Space giữ identity và hierarchy; area là measurement riêng vì một space có thể có nhiều chuẩn đo.",
            },
          ],
          quiz: [
            {
              id: "w01-l01-q1",
              prompt: "Vì sao không nên đặt leaseId trực tiếp làm thuộc tính bắt buộc của Space?",
              correctAnswer: "Vì quyền sử dụng thay đổi theo thời gian và một lease có thể bao phủ nhiều space; LeaseSpace là relation phù hợp hơn.",
              explanation: "Identity vật lý của space sống lâu hơn hợp đồng.",
            },
          ],
        }),
        defineLesson({
          id: "w01-l02",
          title: "Capability và bốn trạng thái dễ nhầm",
          durationMinutes: 60,
          summary: "Tách đặc tính có thể giao dịch khỏi trạng thái hợp đồng và hành vi sử dụng.",
          why:
            "Available, vacant, occupied và utilized trả lời bốn câu hỏi khác nhau. Gộp chúng thành một enum khiến inventory và dashboard tự mâu thuẫn.",
          concepts: [
            {
              id: "space-capability",
              term: "Space capability",
              definition: "Khả năng mà space hỗ trợ: leaseable, bookable, serviceable hoặc common-area; nhiều capability có thể cùng tồn tại.",
              why: "Một meeting room có thể bookable và serviceable nhưng không leaseable; capability composition mở rộng tốt hơn subtype explosion.",
              actors: ["Leasing team", "Community manager", "Facility manager"],
            },
            {
              id: "space-state-taxonomy",
              term: "Available / Vacant / Occupied / Utilized",
              definition: "Available = được phép đưa ra cung; Vacant = không có quyền chiếm dụng hiện hành; Occupied = có quyền/assignment; Utilized = thực tế có người dùng trong khoảng đo.",
              why: "Mỗi trạng thái dẫn tới một quyết định khác: bán, lease, access hay tối ưu vận hành.",
              actors: ["Leasing team", "Property manager", "Workplace analyst"],
              variants: [
                { name: "Available", definition: "Sẵn sàng đưa vào denominator của inventory.", useWhen: "Tính nguồn cung có thể bán/lease/book.", contrastWith: "Unavailable do renovation hoặc owner hold." },
                { name: "Vacant", definition: "Không bị ràng buộc bởi occupancy right tại thời điểm xét.", useWhen: "Theo dõi vacancy và leasing pipeline.", contrastWith: "Occupied dù người thuê hôm nay không đến." },
                { name: "Occupied", definition: "Đã được lease, license hoặc assign.", useWhen: "Đo contractual/physical occupancy.", contrastWith: "Utilized là hành vi thực tế." },
                { name: "Utilized", definition: "Có sử dụng thực tế theo sensor, check-in hoặc booking attended.", useWhen: "Tối ưu capacity và trải nghiệm.", contrastWith: "Occupied không đảm bảo có mặt." },
              ],
              commonMistake: "Coi occupied = unavailable; occupied resource vẫn thuộc nguồn cung hợp lệ khi tính occupancy denominator.",
            },
          ],
          examples: [
            {
              title: "Suite đang thuê nhưng nhân viên làm hybrid",
              context: "Suite 300 m² đã lease cho Acme cả tháng.",
              scenario: "Ngày thứ Ba chỉ 12/36 desk có người ngồi; tuần sau suite đóng hai ngày để sửa điện.",
              outcome: "Suite occupied 100% theo lease, desk utilization 33% tại thời điểm đo; hai ngày sửa điện là unavailable cho use-case sử dụng nhưng lease right vẫn tồn tại.",
              numbers: ["36 desk occupied/assigned", "12 desk detected", "33.3% utilization"],
            },
          ],
          relations: [
            { from: "SpaceCapabilityAssignment", to: "Space", kind: "references", explanation: "Assignment gắn capability có hiệu lực thời gian vào một space cụ thể." },
            { from: "SpaceCapabilityAssignment", to: "Capability", kind: "classified-as", explanation: "Capability phân loại việc có thể làm với space mà không biến Space thành chính Capability." },
            { from: "OccupancyRight", to: "Occupied interval", kind: "generates", explanation: "Lease/license/assignment tạo khoảng occupied." },
            { from: "Utilization", to: "PresenceSignal", kind: "derived-from", explanation: "Sensor/check-in tạo evidence sử dụng thực." },
          ],
          invariants: [
            "Vacant và occupied phải được đánh giá trên cùng scope và cùng thời điểm mới là đối nghịch.",
            "Utilization không được suy ra chỉ từ việc có lease.",
          ],
          lifecycle: [
            { state: "Available + vacant", trigger: "Space sẵn sàng marketing", businessMeaning: "Có thể đưa vào leasing inventory." },
            { state: "Available + occupied", trigger: "Lease commence", businessMeaning: "Nằm trong nguồn cung và đang được chiếm dụng." },
            { state: "Unavailable", trigger: "Renovation/owner hold", businessMeaning: "Loại khỏi nguồn cung trong interval xác định." },
          ],
          metrics: [
            { name: "Utilization", formula: "used capacity-time / available capacity-time", interpretation: "Mức dùng thực tế của capacity có thể dùng.", decision: "Consolidate space hoặc thay đổi layout.", caution: "Nêu rõ source: booking, check-in hay sensor." },
          ],
          edgeCases: [
            { case: "Desk được book nhưng người dùng no-show", risk: "Booking utilization phóng đại actual utilization.", handling: "Lưu booked, checked-in và sensed như ba signal riêng." },
          ],
          softwareModels: [
            {
              title: "State là projection từ các interval độc lập",
              language: "pseudo",
              code: `isAvailable(space, at) = availabilityIntervals.contains(at)
isOccupied(space, at) = occupancyRights.overlaps(at)
isUtilized(space, at) = presenceSignals.within(at).meetsThreshold()

// Không lưu một field status duy nhất cho cả ba câu hỏi.`,
              explanation: "Projection cho phép cùng một space vừa occupied theo lease vừa không utilized tại một thời điểm.",
            },
          ],
          quiz: [
            {
              id: "w01-l02-q1",
              prompt: "Một office đã lease nhưng hôm nay không có ai đến là vacant hay không utilized?",
              correctAnswer: "Không utilized tại thời điểm đo; vẫn occupied theo lease và không vacant.",
              explanation: "Contractual right và actual use là hai trục độc lập.",
            },
          ],
        }),
        defineLesson({
          id: "w01-l03",
          title: "Split, merge, area và capacity theo thời gian",
          durationMinutes: 55,
          summary: "Giữ lịch sử identity khi layout và sức chứa thay đổi.",
          why:
            "Commercial space thường được chia hoặc ghép theo tenant. Update đè bản ghi cũ sẽ làm invoice, occupancy lịch sử và maintenance mất nghĩa.",
          concepts: [
            {
              id: "space-version",
              term: "Effective-dated space version",
              definition: "Phiên bản mô tả hình học, area, capacity và capability của space trong một khoảng hiệu lực.",
              why: "Cho phép tái tạo đúng inventory ở một ngày quá khứ.",
              actors: ["Space planner", "Finance analyst", "Product engineer"],
            },
            {
              id: "area-vs-capacity",
              term: "Area vs capacity vs quantity",
              definition: "Area là measurement không gian; capacity là giới hạn người/tài nguyên; quantity là số item đồng nhất được bán.",
              why: "m², người, desk-hour không thể cộng hoặc làm denominator thay thế nhau.",
              actors: ["Leasing team", "Coworking operator"],
            },
          ],
          examples: [
            {
              title: "Chia Suite 5A giữa tháng",
              context: "Suite 5A 300 m² được chia thành 5A-1 180 m² và 5A-2 120 m² từ 16/04.",
              scenario: "Hóa đơn cũ vẫn phải trỏ tới 5A; availability tháng 4 phải prorate 15 ngày cấu trúc cũ và 15 ngày cấu trúc mới.",
              outcome: "Retire version 5A vào 15/04, tạo hai identity/version mới từ 16/04 và relation derived-from.",
              numbers: ["300 m² trước 16/04", "180 + 120 m² sau 16/04"],
            },
          ],
          relations: [
            { from: "SpaceVersion", to: "Space", kind: "references", explanation: "Identity bền vững, version giữ thuộc tính thay đổi." },
            { from: "NewSpace", to: "OldSpace", kind: "derived-from", explanation: "Lineage giải thích split/merge." },
          ],
          invariants: [
            "Các version của cùng một space không overlap thời gian.",
            "Mọi measurement phải có measurement unit, measurement standard và effective interval.",
          ],
          lifecycle: [
            { state: "Current layout", trigger: "Partition plan được duyệt", businessMeaning: "Khóa ngày cut-over." },
            { state: "Transition", trigger: "Thi công", businessMeaning: "Space có thể unavailable." },
            { state: "New layout", trigger: "Nghiệm thu", businessMeaning: "Inventory mới bắt đầu hiệu lực." },
          ],
          metrics: [
            { name: "Space efficiency", formula: "usable area / gross area", interpretation: "Tỷ lệ diện tích phục vụ người dùng.", decision: "So sánh layout.", caution: "Chỉ so sánh khi cùng chuẩn đo area." },
          ],
          edgeCases: [
            { case: "Merge hai suite nhưng một lease cũ còn hiệu lực", risk: "Không thể xóa identity cũ.", handling: "Giữ occupancy relation với old space và ánh xạ allocation sang new layout trong transition." },
          ],
          softwareModels: [
            {
              title: "Measurement có measurement unit và hiệu lực",
              language: "typescript",
              code: `interface MeasurementPeriod {
  spaceId: string;
  value: number;
  validFrom: string;
  validTo?: string;
}

type SpaceMeasurement = MeasurementPeriod & (
  | { kind: "area"; unit: "m2" }
  | { kind: "capacity"; unit: "person" | "desk" }
  | { kind: "quantity"; unit: "room" | "seat" }
);`,
              explanation: "Discriminated union giữ một interface xử lý chung nhưng loại bỏ combination vô nghĩa như area đo bằng desk.",
            },
          ],
          quiz: [
            {
              id: "w01-l03-q1",
              prompt: "Tại sao không update area=180 lên bản ghi Suite 5A cũ?",
              correctAnswer: "Vì sẽ viết lại lịch sử và khiến lease, invoice, occupancy trước ngày split mang sai diện tích.",
              explanation: "Property domain cần bitemporal/effective-dated thinking ngay từ space foundation.",
            },
          ],
        }),
      ],
      checkpointQuestions: [
        "Bạn có thể vẽ hai hierarchy riêng cho physical containment và reporting ownership không?",
        "Trong sản phẩm của bạn, nguồn nào chứng minh occupied và nguồn nào chứng minh utilized?",
        "Khi split space, bản ghi lịch sử nào phải bất biến?",
      ],
      deliverable: "Vẽ domain map cho một tòa nhà 3 tầng có suite, meeting room và desk; ghi capability, measurement và interval lên từng node.",
      sourceSuggestions: [
        { label: "BOMA Foundations — building operations", url: "https://boma.org/education/courses/foundations-of-real-estate-management/" },
        { label: "OfficeRnD Help Center — Resources & Occupancy Intervals", url: "https://help.officernd.com/en/articles/313572-flex-resources-start-here" },
      ],
    }),

    defineWeek({
      id: "week-02",
      number: 2,
      domain: "lease",
      title: "Tenant & Lease Lifecycle",
      subtitle: "Hợp đồng là quyền và nghĩa vụ theo thời gian, không chỉ là một PDF",
      estimatedHours: 6,
      learningObjectives: [
        "Phân biệt tenant, legal party, occupant và billing account.",
        "Mô tả lifecycle lead → proposal → executed lease → commencement → renewal/termination.",
        "Tách term, charge schedule, deposit và amendment.",
        "Nhận diện các interval contract, possession, billing và occupancy khác nhau.",
      ],
      why:
        "Commercial property xoay quanh contractual rights over space. Lease model quyết định inventory, billing, AR, occupancy và forecast nhiều năm.",
      lessons: [
        defineLesson({
          id: "w02-l01",
          title: "Actors, quyền và các mốc thời gian",
          durationMinutes: 60,
          summary: "Tách legal party khỏi người dùng thực tế và tách bốn loại ngày của lease.",
          why: "Một tên tenant duy nhất không trả lời được ai ký, ai trả tiền, ai chiếm dụng và ai nhận thông báo.",
          concepts: [
            {
              id: "lease-party-role",
              term: "Lease party role",
              definition: "Vai trò của một Party trong lease: landlord, tenant, guarantor, payer, occupant hoặc billing contact.",
              why: "Role-based relation cho phép một pháp nhân giữ nhiều vai trò và thay đổi contact mà không đổi lease identity.",
              actors: ["Leasing manager", "Legal", "AR team"],
            },
            {
              id: "lease-dates",
              term: "Execution / possession / commencement / billing date",
              definition: "Ngày ký tạo cam kết; possession giao mặt bằng; commencement bắt đầu term; billing start bắt đầu sinh charge — chúng có thể khác nhau.",
              why: "Dùng một startDate sẽ làm sai availability, revenue recognition và access.",
              actors: ["Property manager", "Accountant", "Facility manager"],
            },
          ],
          examples: [
            {
              title: "Acme nhận mặt bằng sớm",
              context: "Lease ký 01/03, nhận mặt bằng 15/03 để fit-out, commence 01/04, miễn rent đến 30/04.",
              scenario: "Facility cần cấp quyền vào từ 15/03; occupancy contractual bắt đầu theo policy 01/04; billing base rent từ 01/05.",
              outcome: "Lưu các interval/sự kiện riêng thay vì suy ra tất cả từ startDate.",
              numbers: ["31 ngày rent-free", "17 ngày early access"],
            },
          ],
          relations: [
            { from: "Party", to: "Lease", kind: "references", explanation: "LeaseParty gắn Party với một role." },
            { from: "Lease", to: "Space", kind: "references", explanation: "LeaseSpace ghi quyền trên space và interval." },
          ],
          invariants: [
            "Executed lease phải có ít nhất một landlord và một tenant legal party.",
            "LeaseSpace interval phải nằm trong hoặc được giải thích so với lease contractual term.",
          ],
          lifecycle: [
            { state: "Draft", trigger: "Proposal được chấp nhận để soạn", businessMeaning: "Chưa tạo nghĩa vụ tài chính chính thức." },
            { state: "Executed", trigger: "Đủ chữ ký", businessMeaning: "Cam kết pháp lý đã tồn tại." },
            { state: "Commenced", trigger: "Đến commencement date/đủ condition", businessMeaning: "Term vận hành bắt đầu." },
            { state: "Ended", trigger: "Expire hoặc terminate", businessMeaning: "Không tạo nghĩa vụ mới ngoài close-out." },
          ],
          metrics: [
            { name: "Lease term remaining", formula: "contractual end − as-of date", interpretation: "Thời gian doanh thu còn được bảo đảm.", decision: "Ưu tiên renewal pipeline.", caution: "Xét break option có khả năng thực thi." },
          ],
          edgeCases: [
            { case: "Tenant đổi tên pháp nhân sau M&A", risk: "Sửa tên làm mất audit trail hoặc sai debtor.", handling: "Giữ Party identity, legal-name history và novation/amendment rõ ràng." },
          ],
          softwareModels: [
            {
              title: "Party-role relation",
              language: "typescript",
              code: `interface LeaseParty {
  leaseId: string;
  partyId: string;
  role: "landlord" | "tenant" | "guarantor" | "payer" | "occupant";
  validFrom: string;
  validTo?: string;
}`,
              explanation: "Party là abstraction dùng chung; role mới mang ngữ nghĩa trong context lease.",
            },
          ],
          quiz: [
            { id: "w02-l01-q1", prompt: "Ngày ký lease có luôn là ngày bắt đầu billing không?", correctAnswer: "Không; execution, possession, commencement và billing start là các mốc độc lập.", explanation: "Mỗi mốc kích hoạt một nhóm quyền/nghĩa vụ khác nhau." },
          ],
        }),
        defineLesson({
          id: "w02-l02",
          title: "Lease term, charge schedule và deposit",
          durationMinutes: 65,
          summary: "Biến điều khoản hợp đồng thành schedule có thể tính toán mà chưa biến nó thành invoice.",
          why: "Term mô tả nghĩa vụ tương lai; invoice là chứng từ billing tại một kỳ. Tách hai lớp giúp reforecast và amendment không viết lại chứng từ đã phát hành.",
          concepts: [
            {
              id: "lease-charge",
              term: "Lease Charge",
              definition: "Quy tắc nghĩa vụ định kỳ hoặc một lần từ lease, gồm amount/rate, frequency, effective interval, tax và escalation.",
              why: "Là nguồn để billing engine sinh charge occurrence, không phải bản thân invoice line.",
              actors: ["Lease administrator", "Billing team"],
              commonMistake: "Cho LeaseCharge một invoiceStatus và dùng nó như chứng từ kế toán.",
            },
            {
              id: "security-deposit",
              term: "Security deposit",
              definition: "Khoản tiền nắm giữ để bảo đảm nghĩa vụ, thường là liability cho đến khi được hoàn, cấn trừ hoặc legally forfeited.",
              why: "Nhận deposit làm tăng cash nhưng chưa tạo rent revenue.",
              actors: ["Property accountant", "Tenant", "AR team"],
            },
            {
              id: "service-charge-recovery",
              term: "Service Charge / CAM recovery",
              definition: "Cơ chế landlord thu hồi Common Area Maintenance và operating expenses đủ điều kiện: bill khoản ước tính trong năm, gom actual recoverable expense vào pool, phân bổ theo share/rule rồi annual reconciliation để tạo true-up.",
              why: "Estimate, actual expense và tenant recovery là ba lớp khác nhau; tách chúng mới giải thích được tenant phải trả thêm hay nhận credit cuối năm.",
              actors: ["Property accountant", "Lease administrator", "Tenant AP"],
              variants: [
                { name: "Fixed service charge", definition: "Khoản charge cố định theo lease, không đối soát trực tiếp với expense pool.", useWhen: "Hợp đồng quy định mức phí trọn gói.", contrastWith: "CAM recovery theo actual và true-up." },
                { name: "Estimated CAM with true-up", definition: "Thu tạm ứng theo budget rồi đối soát với actual recoverable share.", useWhen: "Lease cho phép annual reconciliation.", contrastWith: "Không sửa lại invoice tạm tính đã phát hành." },
              ],
              commonMistake: "Bill actual expense trực tiếp cho tenant mà bỏ qua exclusions, cap, gross-up, share basis và khoản ước tính đã thu.",
            },
          ],
          examples: [
            {
              title: "Rent có escalation và deposit",
              context: "Office 200 m², rent 500.000đ/m²/tháng, tăng 5% mỗi năm, deposit 3 tháng.",
              scenario: "LeaseCharge có hai rate period; deposit obligation thu 300 triệu và giữ trong liability account.",
              outcome: "Billing có thể sinh đúng 100 triệu/tháng năm một, 105 triệu/tháng năm hai mà deposit không đi vào revenue.",
              numbers: ["Base rent: 100.000.000đ/tháng", "Deposit: 300.000.000đ", "Year-2 rent: 105.000.000đ/tháng"],
            },
            {
              title: "CAM annual reconciliation",
              context: "Actual recoverable pool của tòa nhà là 1,2 tỷ đồng; Acme chịu 8% theo lease và đã trả 7 triệu/tháng tiền ước tính.",
              scenario: "RecoveryRule áp exclusions/cap/gross-up trước khi tính share. Actual share của Acme là 96 triệu; estimated charges đã bill là 84 triệu.",
              outcome: "AnnualReconciliation tạo debit adjustment 12 triệu, giữ nguyên 12 invoice ước tính và trace được từ expense pool đến từng allocation.",
              numbers: ["1.200.000.000đ × 8% = 96.000.000đ", "7.000.000đ × 12 = 84.000.000đ", "True-up debit = 12.000.000đ"],
            },
          ],
          relations: [
            { from: "LeaseTerm", to: "LeaseCharge", kind: "contains", explanation: "Term chứa quy tắc nghĩa vụ có hiệu lực." },
            { from: "LeaseCharge", to: "ChargeOccurrence", kind: "generates", explanation: "Schedule materialize nghĩa vụ từng kỳ." },
            { from: "DepositReceipt", to: "DepositLiability", kind: "classified-as", explanation: "Cash nhận hộ/giữ hộ tạo khoản phải trả lại." },
            { from: "RecoveryRule", to: "EstimatedServiceCharge", kind: "generates", explanation: "Budget và lease rule sinh khoản CAM tạm tính theo kỳ." },
            { from: "RecoverableExpensePool", to: "AnnualReconciliation", kind: "generates", explanation: "Actual eligible expense được phân bổ theo share, cap, exclusion và gross-up policy." },
            { from: "AnnualReconciliation", to: "Debit/CreditAdjustment", kind: "generates", explanation: "True-up là delta so với estimate đã bill, không rewrite invoice cũ." },
          ],
          invariants: [
            "Hai rate period của cùng charge component không được overlap ngoài chủ đích override.",
            "Deposit balance = receipts + positive adjustments − applications − refunds − forfeitures và không âm nếu không có policy đặc biệt.",
            "CAM true-up = tenant actual recoverable share − estimated recoveries đã bill, với cùng currency, lease rule version và reconciliation period.",
          ],
          lifecycle: [
            { state: "Scheduled", trigger: "Lease executed", businessMeaning: "Nghĩa vụ tương lai đã được cấu hình." },
            { state: "Due", trigger: "Billing date", businessMeaning: "Charge occurrence đủ điều kiện lập hóa đơn." },
            { state: "Settled/held", trigger: "Payment allocated", businessMeaning: "Rent giảm AR; deposit tăng liability." },
            { state: "Reconciled", trigger: "Expense year close", businessMeaning: "CAM estimate được đối soát và true-up bằng adjustment riêng." },
          ],
          metrics: [
            { name: "Contracted rent", formula: "Σ effective lease charge trong kỳ", interpretation: "Doanh thu rent theo hợp đồng trước collection.", decision: "Forecast cash/revenue.", caution: "Tách rent-free và straight-line accounting nếu áp dụng." },
            { name: "CAM recovery ratio", formula: "tenant recoveries / eligible recoverable expense pool", interpretation: "Mức operating expense đã thu hồi theo lease.", decision: "Kiểm tra leakage và budget năm sau.", caution: "Không kỳ vọng 100% nếu có cap, exclusion, owner share hoặc vacancy/gross-up policy." },
          ],
          edgeCases: [
            { case: "Deposit được dùng trả tháng rent cuối", risk: "Ghi thẳng payment lần hai hoặc quên giảm liability.", handling: "Tạo explicit deposit application: debit liability, credit AR theo phê duyệt." },
            { case: "Tòa nhà chưa lấp đầy nhưng lease cho gross-up CAM", risk: "Lấy actual cost chia trực tiếp occupied area làm tenant share biến động vô lý.", handling: "Lưu gross-up assumption và rule version; tách expense pool chuẩn hóa khỏi allocation cho từng lease." },
          ],
          softwareModels: [
            {
              title: "Term là schedule, không là invoice",
              language: "typescript",
              code: `type ISO4217 = "VND" | "USD";

interface Money {
  minorUnits: bigint;
  currency: ISO4217;
}

interface LeaseChargeRule {
  id: string;
  leaseId: string;
  kind: "base-rent" | "service-charge" | "parking";
  rate: { amount: Money; per: "month" | "m2-month" };
  cadence: "monthly" | "quarterly" | "once";
  validFrom: string;
  validTo: string;
}

interface RecoveryRule {
  leaseId: string;
  expensePoolId: string;
  allocationBasis: "leased-area-share" | "fixed-share";
  cap?: Money;
  grossUpPercent?: number;
  validFrom: string;
  validTo: string;
}`,
              explanation: "Billing engine đọc rule và kỳ tính để sinh occurrence; CAM reconciliation đọc rule version cùng expense pool để sinh delta. Invoice line chỉ snapshot kết quả đã phát hành.",
            },
          ],
          quiz: [
            { id: "w02-l02-q1", prompt: "LeaseCharge có phải InvoiceLine không?", correctAnswer: "Không. LeaseCharge là nguồn nghĩa vụ/schedule; InvoiceLine là dòng chứng từ đã bill, có thể snapshot hoặc tổng hợp nhiều charge occurrence.", explanation: "Separation này bảo vệ audit trail và hỗ trợ rebilling." },
          ],
        }),
        defineLesson({
          id: "w02-l03",
          title: "Amendment, renewal, break và termination",
          durationMinutes: 60,
          summary: "Thay đổi hợp đồng bằng event/effective version thay vì sửa đè lịch sử.",
          why: "Một lease sống nhiều năm. Người dùng cần trả lời cả 'điều khoản hiện tại' lẫn 'tại sao invoice tháng trước như vậy'.",
          concepts: [
            {
              id: "lease-amendment",
              term: "Lease amendment",
              definition: "Văn bản thay đổi một phần quyền/nghĩa vụ của lease từ ngày hiệu lực mà không nhất thiết tạo lease mới.",
              why: "Giữ lineage pháp lý và cho phép tái tạo version tại mọi as-of date.",
              actors: ["Legal", "Lease administrator", "Accountant"],
            },
            {
              id: "renewal-vs-extension",
              term: "Renewal / Extension / Holdover",
              definition: "Renewal thường là term mới theo option/thỏa thuận; extension kéo dài term; holdover là tiếp tục chiếm dụng sau expiry theo rule đặc biệt.",
              why: "Mỗi biến thể tạo risk, pricing và forecast khác nhau.",
              actors: ["Asset manager", "Leasing manager"],
            },
          ],
          examples: [
            {
              title: "Giảm diện tích khi renewal",
              context: "Acme trả lại Suite 5B và gia hạn Suite 5A thêm 24 tháng.",
              scenario: "LeaseSpace 5B kết thúc ở term cũ; rate mới cho 5A bắt đầu tại renewal; deposit được reassess.",
              outcome: "Space 5B quay lại inventory đúng ngày, billing cũ bất biến và forecast mới phản ánh diện tích còn lại.",
            },
          ],
          relations: [
            { from: "Amendment", to: "LeaseVersion", kind: "generates", explanation: "Amendment tạo version effective-dated." },
            { from: "BreakNotice", to: "EarlyTermination", kind: "precedes", explanation: "Notice hợp lệ kích hoạt close-out sớm." },
          ],
          invariants: [
            "Không sửa/xóa term version đã được dùng để phát hành invoice; thay bằng superseding version hoặc adjustment.",
            "Termination date không tự động đồng nghĩa move-out, final billing hoặc deposit refund date.",
          ],
          lifecycle: [
            { state: "Proposed change", trigger: "Hai bên đàm phán", businessMeaning: "Chỉ dùng scenario forecast." },
            { state: "Executed amendment", trigger: "Đủ chữ ký", businessMeaning: "Version tương lai được xác nhận." },
            { state: "Effective", trigger: "Đến effective date", businessMeaning: "Projection hiện tại chuyển sang term mới." },
            { state: "Closed", trigger: "Final settlement", businessMeaning: "AR/deposit/access đã reconcile." },
          ],
          metrics: [
            { name: "Lease renewal rate", formula: "renewed expiring area / eligible expiring area", interpretation: "Khả năng giữ tenant theo diện tích.", decision: "Pricing và leasing pipeline.", caution: "Nêu rõ denominator loại trừ owner-use/demolished space." },
          ],
          edgeCases: [
            { case: "Amendment ký sau nhưng effective lùi về quá khứ", risk: "Invoice đã phát hành khác điều khoản mới.", handling: "Không rewrite; tính delta và tạo credit/debit adjustment có reference amendment." },
          ],
          softwareModels: [
            {
              title: "Current state là projection của version",
              language: "pseudo",
              code: `leaseAt(leaseId, asOf) =
  versions(leaseId)
    .filter(v => v.effectiveFrom <= asOf)
    .filter(v => !v.effectiveTo || asOf < v.effectiveTo)
    .single()

lateAmendment => calculateDelta(oldVersion, newVersion) => Adjustment`,
              explanation: "As-of query và delta adjustment giải quyết auditability tốt hơn mutable contract row.",
            },
          ],
          quiz: [
            { id: "w02-l03-q1", prompt: "Amendment hồi tố nên update invoice cũ hay tạo delta?", correctAnswer: "Giữ invoice đã phát hành và tạo credit/debit adjustment cho delta, có liên kết về amendment.", explanation: "Chứng từ cần audit trail; current contract projection và billing history là hai concern khác nhau." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Ai là legal tenant, payer và occupant trong case một tập đoàn thuê cho công ty con?",
        "Mốc nào mở access và mốc nào bắt đầu sinh base-rent charge?",
        "Làm sao tái tạo được term đúng tại ngày cuối tháng trước?",
      ],
      deliverable: "Model một lease 3 năm có rent-free, escalation, deposit, early access và amendment giảm diện tích từ năm hai.",
      sourceSuggestions: [
        { label: "MRI — Commercial Lease Administration lifecycle", url: "https://www.mrisoftware.com/blog/what-is-lease-management-administration-process/" },
        { label: "IREM — Lease administration fundamentals", url: "https://www.irem.org/products/courses" },
      ],
    }),

    defineWeek({
      id: "week-03",
      number: 3,
      domain: "billing-ar",
      title: "Rent, Billing, Accounts Receivable & Payment",
      subtitle: "Từ nghĩa vụ hợp đồng đến chứng từ, công nợ và settlement",
      estimatedHours: 6,
      learningObjectives: [
        "Tách Charge, ChargeOccurrence, InvoiceLine và accounting entry.",
        "Mô hình invoice, payment, allocation và AR open item.",
        "Xử lý credit note, refund, overpayment và late fee có audit trail.",
        "Đọc aging report mà không nhầm invoice status với payment status.",
      ],
      why:
        "Billing là cây cầu giữa lease và accounting. Nếu gom schedule, chứng từ, cash và ledger vào một Transaction, hệ thống khó sửa sai và không reconcile được.",
      lessons: [
        defineLesson({
          id: "w03-l01",
          title: "Charge → InvoiceLine: hai abstraction khác nhau",
          durationMinutes: 65,
          summary: "Materialize nghĩa vụ theo kỳ rồi snapshot lên chứng từ.",
          why: "Một invoice line có thể tổng hợp nhiều ngày charge, còn một charge occurrence có thể bị split vì tax hoặc cost center.",
          concepts: [
            {
              id: "charge-occurrence",
              term: "Charge occurrence",
              definition: "Một nghĩa vụ đã materialize cho service period cụ thể từ contract rule hoặc event.",
              why: "Cho phép kiểm tra input, proration và delta trước khi đưa lên invoice.",
              actors: ["Billing specialist", "Lease administrator"],
            },
            {
              id: "invoice-line",
              term: "Invoice line",
              definition: "Dòng trên chứng từ thương mại đã phát hành, snapshot mô tả, amount, tax và accounting classification tại thời điểm issue.",
              why: "Invoice phải giữ nguyên lịch sử ngay cả khi source rule thay đổi.",
              actors: ["Tenant AP", "Property accountant", "Tax"],
              commonMistake: "InvoiceLine giữ pointer tới LeaseCharge rồi render amount hiện tại, khiến invoice cũ đổi theo contract.",
            },
          ],
          examples: [
            {
              title: "Base rent bắt đầu giữa tháng",
              context: "Rent tháng 4 là 100 triệu nhưng commencement 16/04.",
              scenario: "Billing policy actual-days prorate tạo ChargeOccurrence 50 triệu cho 15/30 ngày; invoice line snapshot service period 16–30/04.",
              outcome: "Khi rate tháng 5 thay đổi, invoice tháng 4 vẫn giữ 50 triệu và basis 15/30.",
              numbers: ["100.000.000 × 15/30 = 50.000.000đ"],
            },
          ],
          relations: [
            { from: "LeaseChargeRule", to: "ChargeOccurrence", kind: "generates", explanation: "Rule + billing period + proration policy sinh nghĩa vụ." },
            { from: "ChargeOccurrence", to: "InvoiceLine", kind: "reported-through", explanation: "Mapping có thể 1-n hoặc n-1, cần traceability." },
          ],
          invariants: [
            "Charge occurrence phải có service period, source và calculation basis.",
            "Tổng mapping amount từ occurrences phải bằng invoice line net amount, trừ rounding được ghi rõ.",
          ],
          lifecycle: [
            { state: "Calculated", trigger: "Billing run", businessMeaning: "Có thể preview/validate." },
            { state: "Approved", trigger: "Billing review", businessMeaning: "Khóa input cho issue." },
            { state: "Invoiced", trigger: "Invoice issued", businessMeaning: "Trở thành receivable/open item." },
            { state: "Adjusted", trigger: "Credit/debit note", businessMeaning: "Không sửa chứng từ gốc." },
          ],
          metrics: [
            { name: "Billing completeness", formula: "invoiced eligible occurrences / all eligible occurrences", interpretation: "Có bỏ sót nghĩa vụ đến hạn không.", decision: "Dừng close kỳ hoặc điều tra exception.", caution: "Đo theo occurrence và amount để thấy materiality." },
          ],
          edgeCases: [
            { case: "Rounding khi prorate nhiều line", risk: "Tổng line lệch invoice header vài đồng.", handling: "Chọn deterministic rounding và gán residual vào line cuối/cấu hình." },
          ],
          softwareModels: [
            {
              title: "Trace mapping charge-invoice",
              language: "typescript",
              code: `type ISO4217 = "VND" | "USD";

interface Money {
  minorUnits: bigint;
  currency: ISO4217;
}

interface ChargeOccurrence {
  id: string;
  ruleId: string;
  serviceFrom: string;
  serviceTo: string;
  calculatedAmount: Money;
  calculationBasis: string;
}

interface InvoiceLineSource {
  invoiceLineId: string;
  chargeOccurrenceId: string;
  appliedAmount: Money;
}`,
              explanation: "Join entity hỗ trợ split/aggregate và reconcile hai chiều. Money dùng minor unit để tránh sai số floating-point; mọi phép reconcile phải cùng currency.",
            },
          ],
          quiz: [
            { id: "w03-l01-q1", prompt: "Charge khác InvoiceLine ở invariant quan trọng nào?", correctAnswer: "Charge là nghĩa vụ tính theo source và có thể được rebill; InvoiceLine là snapshot trên chứng từ đã phát hành, phải bất biến và điều chỉnh bằng chứng từ mới.", explanation: "Đây là ranh giới giữa contract calculation và commercial document." },
          ],
        }),
        defineLesson({
          id: "w03-l02",
          title: "Payment, allocation và open-item AR",
          durationMinutes: 65,
          summary: "Một payment chỉ giảm công nợ khi được allocate đúng open item.",
          why: "Tiền vào ngân hàng không tự nói nó trả invoice nào; allocation tách bank event khỏi settlement logic.",
          concepts: [
            {
              id: "payment-allocation",
              term: "Payment allocation",
              definition: "Quan hệ áp một phần hoặc toàn bộ payment/credit vào invoice open item.",
              why: "Hỗ trợ partial payment, một payment trả nhiều invoice và unapplied cash.",
              actors: ["AR team", "Tenant", "Treasury"],
            },
            {
              id: "open-item",
              term: "AR open item",
              definition: "Khoản phải thu còn outstanding, được theo dõi theo due date và remaining balance.",
              why: "Aging dựa trên open balance, không chỉ invoice total hay một status boolean.",
              actors: ["Collection team", "Property manager"],
            },
          ],
          examples: [
            {
              title: "Tenant chuyển một cục tiền",
              context: "Acme nợ invoice A 100 triệu và B 50 triệu.",
              scenario: "Acme chuyển 120 triệu không ghi nội dung; AR allocate 100 triệu cho A, 20 triệu cho B.",
              outcome: "A closed, B còn 30 triệu; cash receipt vẫn là một record 120 triệu.",
              numbers: ["Payment 120m", "Allocation A 100m", "Allocation B 20m", "Outstanding B 30m"],
            },
          ],
          relations: [
            { from: "Invoice", to: "Payment", kind: "fulfilled-by", explanation: "PaymentAllocation là many-to-many relation có amount." },
            { from: "Invoice", to: "AROpenItem", kind: "generates", explanation: "Issue invoice debit tạo receivable." },
          ],
          invariants: [
            "Σ active allocations không vượt settled amount của payment sau refund/reversal.",
            "Outstanding = original debit − credits − valid allocations, tính bằng signed amounts thay vì mutable status.",
          ],
          lifecycle: [
            { state: "Received", trigger: "Bank settlement confirmed", businessMeaning: "Cash có thật nhưng có thể chưa nhận diện payer." },
            { state: "Unapplied", trigger: "Chưa match open item", businessMeaning: "Là customer credit/on-account, chưa đóng invoice." },
            { state: "Partially allocated", trigger: "Allocate một phần", businessMeaning: "Một phần AR được settle." },
            { state: "Fully allocated", trigger: "Remaining=0", businessMeaning: "Payment đã được giải thích hết." },
          ],
          metrics: [
            { name: "Collection rate", formula: "cash allocated to due AR / AR due in period", interpretation: "Khả năng thu các khoản đến hạn.", decision: "Ưu tiên collection và đánh giá tenant risk.", caution: "Không tính unapplied cash nếu chưa chứng minh invoice được trả." },
          ],
          edgeCases: [
            { case: "Payment bị bank charge thiếu 50.000đ", risk: "Invoice không bao giờ fully paid.", handling: "Policy cho write-off tolerance với approval và accounting entry riêng." },
          ],
          softwareModels: [
            {
              title: "Allocation là first-class entity",
              language: "typescript",
              code: `type ISO4217 = "VND" | "USD";

interface Money {
  minorUnits: bigint;
  currency: ISO4217;
}

interface PaymentAllocation {
  id: string;
  paymentId: string;
  openItemId: string;
  amount: Money;
  allocatedAt: string;
  reversedById?: string;
}

function outstanding(
  openItem: { debit: Money; credits: Money },
  activeAllocations: PaymentAllocation[],
): Money {
  const currency = openItem.debit.currency;
  const amounts = [openItem.credits, ...activeAllocations.map((item) => item.amount)];
  if (amounts.some((money) => money.currency !== currency)) {
    throw new Error("Currency mismatch requires an explicit FX policy");
  }

  return {
    currency,
    minorUnits: openItem.debit.minorUnits
      - amounts.reduce((sum, money) => sum + money.minorUnits, 0n),
  };
}`,
              explanation: "Không đặt invoice.paymentId vì cardinality thực tế là many-to-many và có reversal. Value object Money buộc currency đi cùng amount và chặn phép trừ ngầm giữa hai đồng tiền.",
            },
          ],
          quiz: [
            { id: "w03-l02-q1", prompt: "Nhận đủ 100 triệu vào bank có đủ để đánh dấu invoice paid không?", correctAnswer: "Chưa; cần xác nhận settlement và allocation payment vào đúng open item.", explanation: "Cash receipt và AR settlement là hai event có thể lệch thời điểm." },
          ],
        }),
        defineLesson({
          id: "w03-l03",
          title: "Credit, refund, aging và exception",
          durationMinutes: 60,
          summary: "Sửa sai bằng counter-document, phân loại nợ theo due date và quản lý exception rõ ràng.",
          why: "Happy path chỉ che giấu sai sót. Hệ thống billing đáng tin phải giải thích được reversal, overpayment và số dư âm.",
          concepts: [
            {
              id: "credit-note",
              term: "Credit note",
              definition: "Chứng từ giảm số phải thu/doanh thu/tax liên quan tới invoice đã phát hành.",
              why: "Bảo toàn audit trail thay vì sửa/xóa invoice.",
              actors: ["Billing team", "Tax", "Tenant AP"],
            },
            {
              id: "ar-aging",
              term: "AR aging",
              definition: "Phân nhóm open balance theo số ngày quá hạn tính từ due date tại as-of date.",
              why: "Cho collection team biết khoản nào rủi ro và cần hành động trước.",
              actors: ["Collection team", "Owner"],
            },
          ],
          examples: [
            {
              title: "Tính thừa service charge",
              context: "Invoice 110 triệu gồm rent 100 triệu và service charge 10 triệu; service charge đúng là 8 triệu.",
              scenario: "Phát hành credit note 2 triệu tham chiếu line gốc; nếu tenant đã trả đủ thì tạo customer credit hoặc refund.",
              outcome: "Invoice gốc bất biến, AR net còn 108 triệu và tax/reporting có trace.",
            },
          ],
          relations: [
            { from: "CreditNote", to: "InvoiceLine", kind: "references", explanation: "Reference chỉ rõ phần nào được điều chỉnh." },
            { from: "CustomerCredit", to: "Refund", kind: "fulfilled-by", explanation: "Refund settle nghĩa vụ trả lại customer." },
          ],
          invariants: [
            "Credit không vượt phần eligible chưa credit của source nếu policy không cho standalone credit.",
            "Aging bucket phải dùng một as-of date và timezone/cutoff nhất quán.",
          ],
          lifecycle: [
            { state: "Disputed", trigger: "Tenant khiếu nại", businessMeaning: "Open item còn tồn tại nhưng collection có thể hold." },
            { state: "Credited", trigger: "Credit note issued", businessMeaning: "Giảm balance bằng chứng từ đối ứng." },
            { state: "Refund pending", trigger: "Credit được duyệt hoàn", businessMeaning: "Tạo payable/customer refund obligation." },
            { state: "Refunded", trigger: "Bank settle", businessMeaning: "Cash out và credit được settle." },
          ],
          metrics: [
            { name: "Days Sales Outstanding", formula: "average AR / credit revenue × days", interpretation: "Số ngày trung bình để thu tiền.", decision: "Đánh giá collection efficiency.", caution: "Seasonality và deposit/on-account cash có thể làm sai nếu classification kém." },
          ],
          edgeCases: [
            { case: "Credit note phát hành sau ngày chốt kỳ", risk: "Rewrite kỳ cũ hoặc sai current aging.", handling: "Post vào kỳ mở theo accounting policy, giữ original service/tax references." },
          ],
          softwareModels: [
            {
              title: "Aging là query as-of",
              language: "sql",
              code: `days_overdue = max(0, as_of_date - due_date)
bucket = case
  when days_overdue = 0 then 'current'
  when days_overdue <= 30 then '1-30'
  when days_overdue <= 60 then '31-60'
  when days_overdue <= 90 then '61-90'
  else '90+'
end`,
              explanation: "Không lưu aging bucket cố định vì nó thay đổi mỗi ngày dù không có transaction mới.",
            },
          ],
          quiz: [
            { id: "w03-l03-q1", prompt: "Tenant trả thừa thì phần thừa là revenue hay gì?", correctAnswer: "Thường là unapplied customer credit/liability cho đến khi được allocate vào nghĩa vụ hợp lệ hoặc refund.", explanation: "Cash in không tự tạo revenue." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Bạn có trace được từ invoice line về rule, service period và phép prorate không?",
        "Một payment trả ba invoice được model ở đâu?",
        "Aging ngày 31/05 có tái tạo y hệt sau ba tháng không?",
      ],
      deliverable: "Thiết kế billing run tháng 4 cho ba lease, trong đó có mid-month commencement, partial payment, overpayment và một credit note.",
      sourceSuggestions: [
        { label: "BOMA — Accounting & financial reporting", url: "https://boma.org/education/career-paths/property-management/" },
        { label: "MRI — Lease-to-ledger workflows", url: "https://www.mrisoftware.com/solutions/commercial-real-estate-software/" },
      ],
    }),

    defineWeek({
      id: "week-04",
      number: 4,
      domain: "finance-noi",
      title: "Revenue, Expense, Cash Flow & NOI",
      subtitle: "Một dòng tiền có nhiều cách phân loại tùy câu hỏi đang trả lời",
      estimatedHours: 6,
      learningObjectives: [
        "Giải thích Cash In ≠ Revenue và Cash Out ≠ Expense.",
        "Hạch toán deposit như liability cho đến khi có event chuyển loại.",
        "Phân biệt OpEx, CapEx, AP, accrual và cash basis.",
        "Tính NOI và giải thích vì sao NOI không phải cash flow hay lợi nhuận kế toán cuối cùng.",
      ],
      why:
        "Financial truth không thể nằm trong một transactionType. Cash flow, accounting, operating performance và stakeholder reporting là các classification axis độc lập.",
      lessons: [
        defineLesson({
          id: "w04-l01",
          title: "Cash, revenue và deposit liability",
          durationMinutes: 65,
          summary: "Nhìn cùng một bank event qua cash, accounting và contract obligation.",
          why: "Nếu mọi cash in đều là income, deposit và tiền trả trước sẽ làm doanh thu/NOI phóng đại.",
          concepts: [
            {
              id: "cash-vs-revenue",
              term: "Cash In vs Revenue",
              definition: "Cash In là chuyển động tiền; Revenue là giá trị earned khi cung cấp hàng hóa/quyền sử dụng/dịch vụ theo policy.",
              why: "Thời điểm và classification khác nhau; một event có thể chỉ ảnh hưởng balance sheet.",
              actors: ["Treasury", "Accountant", "Asset manager"],
              variants: [
                { name: "Deposit receipt", definition: "Cash tăng, liability tăng.", useWhen: "Tiền còn có thể phải trả lại.", contrastWith: "Revenue chỉ khi earned/forfeited hợp lệ." },
                { name: "Advance rent", definition: "Cash tăng, deferred revenue/liability tăng trước service period.", useWhen: "Tenant trả trước.", contrastWith: "Recognized rent theo kỳ cung cấp quyền sử dụng." },
              ],
            },
          ],
          examples: [
            {
              title: "Tháng nhận tiền lớn nhưng revenue bình thường",
              context: "Tenant chuyển 300 triệu deposit và 100 triệu rent tháng đầu.",
              scenario: "Bank cash in 400 triệu; earned rent 100 triệu; deposit liability 300 triệu.",
              outcome: "Cash dashboard hiển thị 400 triệu inflow, P&L/NOI chỉ nhận 100 triệu revenue, balance sheet có 300 triệu liability.",
              numbers: ["Cash in 400m", "Revenue 100m", "Deposit liability 300m"],
            },
          ],
          relations: [
            { from: "BankTransaction", to: "CashFlowClassification", kind: "classified-as", explanation: "Cho biết inflow/outflow và hoạt động." },
            { from: "DepositReceipt", to: "Liability", kind: "generates", explanation: "Nghĩa vụ hoàn/cấn trừ còn tồn tại." },
            { from: "RevenueRecognition", to: "ServicePeriod", kind: "derived-from", explanation: "Revenue theo earned activity, không theo bank date." },
          ],
          invariants: [
            "Mọi bank transaction phải reconcile nhưng không bắt buộc có revenue/expense classification.",
            "Deposit chỉ chuyển sang revenue/AR settlement khi có event và authority rõ ràng.",
          ],
          lifecycle: [
            { state: "Received", trigger: "Bank settle", businessMeaning: "Cash tăng và deposit liability được ghi nhận." },
            { state: "Held", trigger: "Trong lease term", businessMeaning: "Không tác động NOI." },
            { state: "Applied", trigger: "Được phép cấn AR/damage", businessMeaning: "Giảm liability và settle nghĩa vụ khác." },
            { state: "Refunded", trigger: "Lease close-out", businessMeaning: "Cash out, giảm liability; không phải expense." },
          ],
          metrics: [
            { name: "Operating cash collection", formula: "cash allocated cho operating charges", interpretation: "Cash thực thu từ hoạt động.", decision: "Liquidity và collection.", caution: "Loại deposit, financing và owner contribution." },
          ],
          edgeCases: [
            { case: "Deposit bị giữ một phần vì damage", risk: "Ghi toàn bộ thành rent revenue.", handling: "Tách amount applied to repair receivable, forfeiture/other income và amount refund theo policy." },
          ],
          softwareModels: [
            {
              title: "Đa trục classification",
              language: "typescript",
              code: `interface FinancialEventClassification {
  eventId: string;
  cashFlow?: "operating" | "investing" | "financing";
  accounting?: "asset" | "liability" | "revenue" | "expense" | "equity";
  operating?: "rent" | "service-charge" | "opex" | "non-operating";
  reportingTags: string[];
}`,
              explanation: "Polymorphism theo classification axis tránh một TransactionType khổng lồ.",
            },
          ],
          quiz: [
            { id: "w04-l01-q1", prompt: "Hoàn deposit là Cash Out và Expense đúng không?", correctAnswer: "Là Cash Out nhưng thường không là Expense; đó là giảm cash và giảm deposit liability.", explanation: "Expense đã không phát sinh chỉ vì trả lại tiền đang giữ hộ." },
          ],
        }),
        defineLesson({
          id: "w04-l02",
          title: "Expense, payable, accrual và CapEx",
          durationMinutes: 65,
          summary: "Tách lúc nhận dịch vụ, lúc nhận invoice và lúc trả tiền; tách operating cost khỏi investment vào asset.",
          why: "Cash basis dễ triển khai nhưng làm performance theo tháng méo; OpEx/CapEx sai làm NOI và asset value sai.",
          concepts: [
            {
              id: "accrual",
              term: "Accrual",
              definition: "Ghi nhận expense/revenue trong kỳ kinh tế phát sinh dù invoice hoặc cash đến ở kỳ khác.",
              why: "Matching đúng revenue với cost của cùng kỳ vận hành.",
              actors: ["Property accountant", "Owner"],
            },
            {
              id: "opex-capex",
              term: "Operating Expense vs Capital Expenditure",
              definition: "OpEx duy trì hoạt động thường kỳ; CapEx tạo/nâng cấp lợi ích dài hạn và thường được vốn hóa theo policy.",
              why: "NOI thường trừ OpEx nhưng không trừ CapEx trực tiếp; classification ảnh hưởng valuation.",
              actors: ["Property manager", "Asset manager", "Accountant"],
              commonMistake: "Phân loại chỉ theo amount threshold mà bỏ nature và useful life.",
            },
          ],
          examples: [
            {
              title: "Điện tháng 4, hóa đơn tháng 5",
              context: "Tòa nhà dùng điện 200 triệu trong tháng 4; vendor xuất invoice ngày 08/05, trả ngày 20/05.",
              scenario: "April close accrue 200 triệu expense/payable; May reverse/replace bằng vendor invoice; cash out ngày 20/05.",
              outcome: "NOI tháng 4 phản ánh chi phí điện tháng 4, còn cash flow tháng 5 phản ánh payment.",
              numbers: ["April OpEx 200m", "May cash out 200m"],
            },
          ],
          relations: [
            { from: "ServiceReceipt", to: "ExpenseAccrual", kind: "generates", explanation: "Evidence dịch vụ nhận tạo estimated liability." },
            { from: "VendorInvoice", to: "AccountsPayable", kind: "generates", explanation: "Invoice xác nhận nghĩa vụ vendor." },
            { from: "AccountsPayable", to: "Payment", kind: "fulfilled-by", explanation: "Payment settle payable, không tạo expense lần hai." },
          ],
          invariants: [
            "Vendor payment không ghi expense lần hai nếu expense đã được recognize/accrue.",
            "OpEx/CapEx decision phải lưu policy/rationale và approval, không chỉ boolean khó audit.",
          ],
          lifecycle: [
            { state: "Incurred", trigger: "Goods/service received", businessMeaning: "Chi phí kinh tế phát sinh." },
            { state: "Accrued", trigger: "Period close trước invoice", businessMeaning: "Estimate expense và liability." },
            { state: "Invoiced", trigger: "Vendor invoice approved", businessMeaning: "AP cụ thể thay estimate." },
            { state: "Paid", trigger: "Bank settle", businessMeaning: "AP và cash giảm." },
          ],
          metrics: [
            { name: "Operating expense ratio", formula: "Operating expenses / operating revenue", interpretation: "Chi phí vận hành tiêu tốn bao nhiêu phần doanh thu.", decision: "Tìm category bất thường và tối ưu contract.", caution: "Loại CapEx/non-operating nhất quán." },
          ],
          edgeCases: [
            { case: "Thay toàn bộ chiller lớn", risk: "Repair vs replacement classification không rõ.", handling: "Route qua capitalization policy, useful-life assessment và asset componentization." },
          ],
          softwareModels: [
            {
              title: "Ba event, không một expense row mutable",
              language: "pseudo",
              code: `GoodsReceived(April) -> accrue Expense + Liability
VendorInvoice(May) -> reverse estimate + recognize actual AP
Payment(May) -> debit AP + credit Cash

economicPeriod != invoiceDate != settlementDate`,
              explanation: "Event chain giữ đúng cả accrual performance và cash movement.",
            },
          ],
          quiz: [
            { id: "w04-l02-q1", prompt: "Trả vendor invoice tháng 5 có làm tăng expense tháng 5 không?", correctAnswer: "Không nhất thiết. Nếu dịch vụ thuộc tháng 4 và đã accrue, payment chỉ settle AP/cash; actual invoice thay estimate theo policy.", explanation: "Invoice, recognition và settlement là ba lifecycle khác nhau." },
          ],
        }),
        defineLesson({
          id: "w04-l03",
          title: "NOI, cash flow và performance bridge",
          durationMinutes: 65,
          summary: "Tính metric vận hành từ classification rõ ràng và bridge về ledger/cash.",
          why: "NOI là ngôn ngữ asset performance nhưng không phải chuẩn duy nhất; nếu không công bố scope, hai dashboard có thể cùng đúng mà số khác nhau.",
          concepts: [
            {
              id: "noi",
              term: "Net Operating Income (NOI)",
              definition: "Operating revenue trừ operating expenses trước financing, income tax, depreciation và thường trước CapEx.",
              why: "Cho thấy asset tạo thu nhập từ vận hành độc lập tương đối với capital structure.",
              actors: ["Asset manager", "Owner", "Investor"],
            },
            {
              id: "noi-cashflow-bridge",
              term: "NOI-to-cash-flow bridge",
              definition: "Reconciliation từ accrual NOI sang cash bằng working-capital movement, CapEx, financing, tax và owner distributions.",
              why: "Giải thích vì sao NOI dương nhưng tài khoản ngân hàng vẫn giảm.",
              actors: ["Asset manager", "Treasury", "Investor"],
            },
          ],
          examples: [
            {
              title: "NOI tốt, cash lại âm",
              context: "Tháng 6 revenue 1 tỷ, OpEx 600 triệu, tenant chưa trả 300 triệu và owner chi 500 triệu CapEx.",
              scenario: "NOI 400 triệu; working capital giảm cash 300 triệu; CapEx 500 triệu.",
              outcome: "Trước financing, cash movement xấp xỉ -400 triệu dù NOI margin 40%.",
              numbers: ["NOI 400m", "AR increase 300m", "CapEx 500m", "Cash before financing -400m"],
            },
          ],
          relations: [
            { from: "NOI", to: "OperatingRevenue", kind: "derived-from", explanation: "NOI include operating revenue theo reporting policy." },
            { from: "NOI", to: "CashFlow", kind: "precedes", explanation: "Bridge thêm working capital, investing và financing." },
          ],
          invariants: [
            "NOI report phải version hóa inclusion policy và account mapping.",
            "Mọi tổng hợp performance phải drill-down/reconcile tới posting hoặc source event.",
          ],
          lifecycle: [
            { state: "Preliminary", trigger: "Operational period end", businessMeaning: "Còn accrual/late invoice." },
            { state: "Closed", trigger: "Accounting close", businessMeaning: "Mapping và adjustments được khóa." },
            { state: "Restated", trigger: "Authorized prior-period adjustment", businessMeaning: "Giữ version và lý do thay đổi." },
          ],
          metrics: [
            { name: "NOI", formula: "Operating revenue − Operating expenses", interpretation: "Thu nhập vận hành của property.", decision: "Budget, valuation và operational intervention.", caution: "Không trộn debt service, depreciation, income tax hoặc CapEx nếu policy định nghĩa standard NOI." },
            { name: "NOI margin", formula: "NOI / Operating revenue", interpretation: "Hiệu quả chuyển revenue thành operating income.", decision: "So sánh period/property tương đồng.", caution: "Tenant mix và gross/net lease structure ảnh hưởng so sánh." },
          ],
          edgeCases: [
            { case: "Owner trả trực tiếp một bill của property", risk: "Expense bị bỏ khỏi NOI vì không đi qua bank account property.", handling: "Recognize expense và owner contribution/due-to-owner riêng; cash scope được ghi rõ." },
          ],
          softwareModels: [
            {
              title: "Metric definition là data có version",
              language: "typescript",
              code: `interface MetricDefinition {
  code: "NOI" | "NOI_MARGIN";
  version: number;
  effectiveFrom: string;
  includedAccountTags: string[];
  excludedAccountTags: string[];
  formula: string;
}`,
              explanation: "Metric layer dùng account tags/classification thay vì hard-code account ID trong UI.",
            },
          ],
          quiz: [
            { id: "w04-l03-q1", prompt: "NOI dương có đảm bảo cash flow dương không?", correctAnswer: "Không. Collection timing, AP, deposit, CapEx, debt service và distribution có thể làm cash flow khác xa NOI.", explanation: "NOI đo operating accrual performance; cash flow đo movement của tiền." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Deposit receipt xuất hiện ở cash flow, P&L và balance sheet như thế nào?",
        "Bill điện tháng 4 nhận tháng 5 thuộc NOI kỳ nào theo accrual basis?",
        "Bạn có bridge được từ NOI đến bank movement mà không tạo rule ngoại lệ trong UI không?",
      ],
      deliverable: "Lập mini financial model ba tháng gồm rent, deposit, prepaid rent, utilities accrual, CapEx và bridge NOI → cash.",
      sourceSuggestions: [
        { label: "BOMA — Property Management Financial Proficiency", url: "https://boma.org/education/career-paths/property-management/" },
        { label: "RICS — Property Finance & Investment", url: "https://www.rics.org/training-events/online-training/on-demand/certificate-property-finance-investment" },
      ],
    }),

    defineWeek({
      id: "week-05",
      number: 5,
      domain: "occupancy",
      title: "Occupancy, Vacancy & Utilization",
      subtitle: "Không có một occupancy rate duy nhất cho mọi quyết định",
      estimatedHours: 6,
      learningObjectives: [
        "Xây taxonomy physical, lease, economic, desk, office, booking và revenue occupancy.",
        "Chọn numerator/denominator/unit/time window phù hợp cho từng metric.",
        "Tính prorated resource-time khi availability và occupancy đổi giữa kỳ.",
        "Tách interval nguồn, snapshot và metric projection để có thể giải thích số liệu.",
      ],
      why:
        "Occupancy là derived concept, không phải field. Khi scope, unit hoặc thời gian khác nhau, cùng một building có thể đồng thời có nhiều occupancy rate đều hợp lệ.",
      lessons: [
        defineLesson({
          id: "w05-l01",
          title: "Taxonomy của occupancy",
          durationMinutes: 65,
          summary: "Mỗi biến thể occupancy trả lời một câu hỏi kinh doanh khác nhau.",
          why: "Một con số không thể đồng thời nói mức lease, tiền thực thu và mức có mặt tại desk.",
          concepts: [
            {
              id: "occupancy-variants",
              term: "Occupancy variants",
              definition: "Họ metric cùng so sánh phần occupied với nguồn cung, nhưng khác definition của occupied, unit và denominator.",
              why: "Taxonomy ngăn team tranh luận bằng cùng một từ nhưng khác phép tính.",
              actors: ["Leasing manager", "Asset manager", "Coworking operator", "Workplace analyst"],
              variants: [
                { name: "Lease occupancy", definition: "Leased area/resource-time trên leasable supply.", useWhen: "Đo thành công leasing.", contrastWith: "Không phản ánh collection hay presence." },
                { name: "Physical occupancy", definition: "Diện tích/resource có occupant/right hiện hành trên physical supply.", useWhen: "Vận hành commercial property.", contrastWith: "Policy có thể khác lease signed nhưng chưa commenced." },
                { name: "Economic occupancy", definition: "Economic rent thực thu/earned trên potential rent.", useWhen: "Đo chất lượng revenue và collection.", contrastWith: "Không phải tỷ lệ m²." },
                { name: "Desk occupancy", definition: "Assigned/contracted desk-time trên available desk-time.", useWhen: "Flex inventory.", contrastWith: "Desk utilization theo presence." },
                { name: "Revenue occupancy", definition: "Revenue thực tế trên revenue potential theo policy.", useWhen: "Pricing và yield.", contrastWith: "Có thể thấp dù physical occupancy cao vì discount." },
              ],
              commonMistake: "Đặt một occupancyRate trên Building mà không lưu metric definition, unit, window và as-of.",
            },
          ],
          examples: [
            {
              title: "Một tầng, ba câu trả lời",
              context: "Tầng có 1.000 m² leasable; 900 m² đã lease, 100 m² trong số đó rent-free; tenant trả đúng 720/800 triệu rent đến hạn.",
              scenario: "Lease occupancy 90%; economic collection proxy 90% trên amount đến hạn; revenue occupancy có thể 80% nếu potential rent là 1 tỷ.",
              outcome: "Dashboard hiển thị ba tên metric và decision owner thay vì một nhãn Occupancy mơ hồ.",
              numbers: ["Lease occupancy 900/1.000 = 90%", "Collection 720/800 = 90%", "Revenue occupancy 800/1.000 = 80%"],
            },
          ],
          relations: [
            { from: "OccupancyMetric", to: "AvailabilityInterval", kind: "derived-from", explanation: "Denominator đến từ available supply." },
            { from: "LeaseOccupancy", to: "OccupancyRight", kind: "derived-from", explanation: "Numerator đến từ commenced lease/license interval theo policy." },
            { from: "EconomicOccupancy", to: "FinancialEvents", kind: "derived-from", explanation: "Dùng billed/earned/collected amount theo định nghĩa." },
          ],
          invariants: [
            "Mọi occupancy metric phải khai báo scope, unit, time grain, numerator và denominator.",
            "Không average phần trăm các space có denominator khác nhau; phải aggregate numerator/denominator trước.",
          ],
          lifecycle: [
            { state: "Defined", trigger: "Metric policy được phê duyệt", businessMeaning: "Có version và owner rõ ràng." },
            { state: "Calculated", trigger: "Interval/source data đủ", businessMeaning: "Kết quả có lineage." },
            { state: "Restated", trigger: "Source correction hoặc policy version mới", businessMeaning: "Giữ cả result/version cũ cho audit." },
          ],
          metrics: [
            { name: "Lease occupancy", formula: "leased leasable-area-time / available leasable-area-time", interpretation: "Mức hấp thụ nguồn cung leaseable.", decision: "Giá thuê, incentive, leasing campaign.", caution: "Signed future lease không mặc định là occupied hiện tại." },
            { name: "Economic occupancy", formula: "recognized/collected rent / gross potential rent", interpretation: "Chất lượng kinh tế của inventory.", decision: "Collection, discount và bad-debt action.", caution: "Nêu rõ dùng earned, billed hay collected numerator." },
          ],
          edgeCases: [
            { case: "Owner-occupied floor", risk: "Tính vào vacant hoặc leased làm méo commercial supply.", handling: "Classify supply purpose và loại/include theo metric policy công khai." },
          ],
          softwareModels: [
            {
              title: "Metric spec thay cho field chung chung",
              language: "typescript",
              code: `interface MetricSpec<V extends string, U extends string> {
  variant: V;
  unit: U;
  numerator: string;
  denominator: string;
  grain: "day" | "month";
  policyVersion: number;
}

type OccupancyMetricSpec =
  | MetricSpec<"lease" | "physical", "m2-day">
  | MetricSpec<"desk", "desk-hour">
  | MetricSpec<"economic" | "revenue", "currency">;`,
              explanation: "Metric engine polymorphic theo generic interface; discriminated union chặn economic occupancy dùng nhầm m²-day.",
            },
          ],
          quiz: [
            { id: "w05-l01-q1", prompt: "Tòa nhà lease occupancy 100% có thể economic occupancy 70% không?", correctAnswer: "Có; toàn bộ area có lease nhưng discount, rent-free, arrears hoặc bad debt làm economic numerator thấp.", explanation: "Physical/contractual supply và money performance là hai taxonomy khác nhau." },
          ],
        }),
        defineLesson({
          id: "w05-l02",
          title: "Intervals và proration chính xác",
          durationMinutes: 70,
          summary: "Tích phân capacity theo thời gian thay vì chụp trạng thái cuối tháng.",
          why: "Space có thể available, occupied và unavailable trong các phần khác nhau của tháng; end-of-month snapshot bỏ mất biến động.",
          concepts: [
            {
              id: "resource-time",
              term: "Resource-time",
              definition: "Đại lượng kết hợp quantity/capacity với duration, ví dụ m²-day, desk-hour hoặc room-hour.",
              why: "Là common denominator cho proration khi supply thay đổi giữa kỳ.",
              actors: ["Data analyst", "Coworking operator", "Asset manager"],
            },
            {
              id: "occupancy-interval",
              term: "Occupancy interval",
              definition: "Khoảng half-open [start, end) mô tả available, occupied hoặc unavailable với source và priority.",
              why: "Cho phép overlap detection, timezone-safe calculation và tái tạo metric.",
              actors: ["Product engineer", "Data engineer"],
            },
          ],
          examples: [
            {
              title: "Suite commence giữa tháng, đóng sửa 3 ngày",
              context: "Suite 100 m² available cả tháng 30 ngày, lease commence 16/04 nhưng unavailable để sửa từ 20–22/04.",
              scenario: "Contractual lease occupancy giữ nguyên cả supply và lease right: 1.500/3.000 = 50%. Eligible operational occupancy loại cùng ba ngày sửa khỏi cả numerator và denominator: 1.200/2.700 = 44,4%.",
              outcome: "Không dùng 1.500/2.700 = 55,6% vì numerator giữ ngày mà denominator đã loại; policy phải bảo toàn quan hệ tập con.",
              numbers: ["Contractual: 1.500 / 3.000 = 50%", "Operational eligible: 1.200 / 2.700 = 44,4%"],
            },
          ],
          relations: [
            { from: "AvailabilityInterval", to: "ResourceTime", kind: "generates", explanation: "Capacity × overlap duration tạo denominator." },
            { from: "OccupancyInterval", to: "ResourceTime", kind: "generates", explanation: "Occupied capacity × overlap duration tạo numerator." },
          ],
          invariants: [
            "Sau khi normalize theo policy, occupied resource-time không vượt available resource-time trong cùng scope nếu metric định nghĩa occupied là subset of available.",
            "Mọi boundary phải thống nhất half-open interval và timezone; end không được tính hai lần.",
          ],
          lifecycle: [
            { state: "Raw intervals", trigger: "Lease, booking, hold, maintenance events", businessMeaning: "Các nguồn có thể overlap/xung đột." },
            { state: "Normalized timeline", trigger: "Áp priority/policy", businessMeaning: "Mỗi segment có supply state rõ ràng." },
            { state: "Aggregated", trigger: "Bucket theo ngày/tháng", businessMeaning: "Numerator và denominator có thể sum an toàn." },
          ],
          metrics: [
            { name: "Prorated occupancy", formula: "Σ occupied quantity × overlap time / Σ available quantity × overlap time", interpretation: "Tỷ lệ sử dụng quyền theo toàn kỳ.", decision: "So sánh tháng có biến động inventory.", caution: "Dùng cùng timezone, unit và exclusion policy." },
          ],
          edgeCases: [
            { case: "Daylight-saving/timezone cho booking theo giờ", risk: "Một ngày không luôn có 24 giờ ở mọi thị trường.", handling: "Lưu instant UTC + venue timezone, bucket theo local business calendar." },
          ],
          softwareModels: [
            {
              title: "Overlap-based proration",
              language: "pseudo",
              code: `for segment in normalize(intervals, window):
  duration = overlap(segment, window).seconds
  if segment.available:
    denominator += segment.capacity * duration
  if segment.occupied && policy.includes(segment):
    numerator += segment.occupiedCapacity * duration

rate = denominator == 0 ? null : numerator / denominator`,
              explanation: "Trả null khi không có supply thay vì 0%, vì 0 sẽ ngụ ý có supply nhưng không occupied.",
            },
          ],
          quiz: [
            { id: "w05-l02-q1", prompt: "Tháng không có available supply nên occupancy là 0% hay null?", correctAnswer: "Thường là null/not applicable vì denominator bằng 0; 0% mang nghĩa có supply nhưng không occupied.", explanation: "Metric semantics cần phân biệt absence of opportunity với poor performance." },
          ],
        }),
        defineLesson({
          id: "w05-l03",
          title: "Snapshot, utilization và data quality",
          durationMinutes: 60,
          summary: "Giữ evidence, projection và aggregate ở ba lớp để drill-down được.",
          why: "Sensor, check-in, booking và lease có độ tin cậy khác nhau; nếu materialize thẳng một status, không thể giải thích hoặc reprocess.",
          concepts: [
            {
              id: "occupancy-snapshot",
              term: "Occupancy snapshot",
              definition: "Projection trạng thái/metric tại một as-of instant hoặc bucket, được tạo từ interval/evidence và policy version.",
              why: "Tăng tốc dashboard nhưng vẫn phải reproducible từ nguồn.",
              actors: ["Data engineer", "Workplace analyst"],
            },
            {
              id: "utilization-evidence",
              term: "Utilization evidence",
              definition: "Tín hiệu actual use như access swipe, check-in, Wi-Fi hoặc sensor, kèm confidence và privacy policy.",
              why: "Không signal nào tự động là ground truth trong mọi context.",
              actors: ["Facility manager", "Privacy officer", "Community manager"],
            },
          ],
          examples: [
            {
              title: "Meeting room được book nhưng no-show",
              context: "Phòng 8 chỗ được book 2 giờ; không có check-in, sensor thấy 0 người.",
              scenario: "Booked utilization tính 2 room-hour; attended utilization tính 0; lost-capacity metric ghi 2 giờ no-show.",
              outcome: "Operator có thể áp reminder/no-show policy thay vì tưởng phòng được dùng tốt.",
            },
          ],
          relations: [
            { from: "PresenceEvidence", to: "UtilizationInterval", kind: "generates", explanation: "Projection engine áp threshold/confidence." },
            { from: "UtilizationInterval", to: "OccupancySnapshot", kind: "reported-through", explanation: "Snapshot/cache phục vụ analytics." },
          ],
          invariants: [
            "Snapshot phải lưu asOf/window, policyVersion và source watermark.",
            "Không suy ra identity cá nhân từ aggregate sensor nếu use case chỉ cần capacity và privacy policy không cho phép.",
          ],
          lifecycle: [
            { state: "Observed", trigger: "Nhận signal", businessMeaning: "Evidence thô có quality/confidence." },
            { state: "Interpreted", trigger: "Áp threshold/deduplication", businessMeaning: "Sinh utilization interval." },
            { state: "Materialized", trigger: "Aggregate job", businessMeaning: "Snapshot nhanh cho dashboard." },
            { state: "Reprocessed", trigger: "Late data/policy change", businessMeaning: "Tạo snapshot version mới." },
          ],
          metrics: [
            { name: "Peak utilization", formula: "max used capacity / available capacity trong window", interpretation: "Capacity cần thiết tại giờ cao điểm.", decision: "Layout và staffing.", caution: "Một spike sensor lỗi cần quality filter." },
            { name: "No-show rate", formula: "booked sessions không attended / eligible booked sessions", interpretation: "Phần capacity bị giữ nhưng không dùng.", decision: "Reminder, cancellation cutoff, penalty.", caution: "Cần grace period và reliable attendance source." },
          ],
          edgeCases: [
            { case: "Sensor offline 4 giờ", risk: "Đọc missing như zero utilization.", handling: "Gắn data coverage; metric null/low-confidence khi dưới threshold." },
          ],
          softwareModels: [
            {
              title: "Evidence và projection tách lớp",
              language: "typescript",
              code: `interface PresenceEvidence {
  spaceId: string;
  observedAt: string;
  source: "sensor" | "check-in" | "access";
  count?: number;
  confidence: number;
}

interface MetricSnapshot {
  metricCode: string;
  window: { from: string; to: string };
  numerator: number;
  denominator: number;
  policyVersion: number;
  dataCoverage: number;
}`,
              explanation: "Raw evidence có thể được diễn giải lại; snapshot luôn chỉ ra quality và metric semantics.",
            },
          ],
          quiz: [
            { id: "w05-l03-q1", prompt: "Booking record có chứng minh actual utilization không?", correctAnswer: "Không; nó chứng minh capacity được reserved. Actual use cần attendance/presence evidence hoặc phải đặt tên metric là booked utilization.", explanation: "Tên metric phải phản ánh đúng source truth." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Metric occupancy của bạn đang dùng m², desk, room hay tiền?",
        "Denominator có loại renovation/owner hold và prorate mid-month không?",
        "Khi sensor thiếu dữ liệu, dashboard biểu diễn zero hay unknown? Why?",
      ],
      deliverable: "Tính ít nhất ba occupancy variant cho cùng một tháng có lease giữa kỳ, unavailable interval, rent-free và no-show booking.",
      sourceSuggestions: [
        { label: "OfficeRnD — Occupancy dashboards: metrics and calculations", url: "https://help-flex.officernd.com/en/articles/248496-occupancy-dashboards-metrics-and-calculations" },
        { label: "OfficeRnD — Occupancy Intervals", url: "https://help.officernd.com/en/articles/313572-flex-resources-start-here" },
      ],
    }),

    defineWeek({
      id: "week-06",
      number: 6,
      domain: "facility",
      title: "Facility, Maintenance & Work Orders",
      subtitle: "People + place + process được nối bằng asset, request và công việc có kiểm soát",
      estimatedHours: 6,
      learningObjectives: [
        "Phân biệt location, maintainable asset, equipment và component.",
        "Giải thích Service Request → triage → Work Order → task → completion.",
        "Mô hình preventive/corrective maintenance, SLA và downtime.",
        "Gắn labor, material và vendor cost vào công việc mà không trộn với AP ledger.",
      ],
      why:
        "Facility Management bảo đảm built environment vận hành. Model tốt phải nối trải nghiệm tenant với physical asset, execution workflow và financial impact.",
      lessons: [
        defineLesson({
          id: "w06-l01",
          title: "Asset registry và maintainable hierarchy",
          durationMinutes: 60,
          summary: "Tách nơi chốn khỏi thiết bị, nhưng giữ relation thiết bị đang phục vụ nơi nào.",
          why: "Một AHU có thể đặt ở phòng kỹ thuật nhưng phục vụ ba tầng; location containment không đồng nghĩa service coverage.",
          concepts: [
            {
              id: "facility-asset",
              term: "Maintainable asset",
              definition: "Đối tượng có identity, condition, maintenance strategy và lifecycle cost cần quản lý, ví dụ chiller, lift, fire pump.",
              why: "Là anchor cho work history, warranty, inspection và replacement plan.",
              actors: ["Facility manager", "Technician", "Asset manager"],
            },
            {
              id: "asset-location-service",
              term: "Located-at vs serves",
              definition: "Located-at mô tả vị trí vật lý; serves mô tả zone/space nhận dịch vụ từ asset.",
              why: "Impact analysis cần biết cả nơi tìm thiết bị và khu vực bị ảnh hưởng khi hỏng.",
              actors: ["Technician", "Help desk"],
            },
          ],
          examples: [
            {
              title: "AHU-05 mất lạnh",
              context: "AHU-05 đặt ở plant room tầng 5 nhưng cấp gió cho Suite 5A và 5B.",
              scenario: "Alarm tạo incident trên asset; impact query tìm hai suite/tenant affected.",
              outcome: "Kỹ thuật biết nơi sửa, help desk biết ai cần thông báo.",
            },
          ],
          relations: [
            { from: "Equipment", to: "Space", kind: "references", explanation: "locatedAt và serves là hai typed relation." },
            { from: "Asset", to: "AssetComponent", kind: "contains", explanation: "Componentization theo maintenance/replacement need." },
          ],
          invariants: [
            "Asset tag/identity không đổi khi asset chuyển location.",
            "Retired asset giữ work, meter và cost history; không hard-delete.",
          ],
          lifecycle: [
            { state: "Planned", trigger: "CapEx approved", businessMeaning: "Có budget/spec nhưng chưa in service." },
            { state: "Commissioned", trigger: "Nghiệm thu", businessMeaning: "Bắt đầu warranty và maintenance plan." },
            { state: "In service", trigger: "Vận hành", businessMeaning: "Nhận meter, inspection và work order." },
            { state: "Retired", trigger: "Decommission/replacement", businessMeaning: "Đóng lifecycle nhưng giữ history." },
          ],
          metrics: [
            { name: "Asset availability", formula: "uptime / required service time", interpretation: "Tỷ lệ asset sẵn sàng cung cấp chức năng.", decision: "Preventive plan và replacement.", caution: "Required service window khác calendar time." },
          ],
          edgeCases: [
            { case: "Thay motor trong AHU", risk: "Tạo asset mới cho mọi part làm registry bùng nổ, hoặc không track part critical.", handling: "Componentize khi part có serial/warranty/maintenance/cost decision riêng." },
          ],
          softwareModels: [
            {
              title: "Typed asset-space relation",
              language: "typescript",
              code: `interface AssetSpaceRelation {
  assetId: string;
  spaceId: string;
  type: "located-at" | "serves" | "isolates";
  validFrom: string;
  validTo?: string;
}`,
              explanation: "Một general relation với taxonomy type hỗ trợ impact graph mà không nhồi servedSpaceIds vào asset.",
            },
          ],
          quiz: [
            { id: "w06-l01-q1", prompt: "Vì sao asset.locationId không đủ cho impact analysis?", correctAnswer: "Vì nơi thiết bị đặt có thể khác các space nó phục vụ; cần typed serves relation.", explanation: "Physical containment và functional dependency là hai graph khác nhau." },
          ],
        }),
        defineLesson({
          id: "w06-l02",
          title: "Service Request → Work Order",
          durationMinutes: 70,
          summary: "Tách nhu cầu/báo lỗi từ người dùng khỏi đơn vị công việc được phê duyệt và thực thi.",
          why: "Một request có thể trùng, không cần work, hoặc sinh nhiều work order; một work order cũng có thể giải quyết nhiều request cùng nguyên nhân.",
          concepts: [
            {
              id: "service-request",
              term: "Service Request",
              definition: "Bản ghi nhu cầu/sự cố từ requester, mô tả symptom, location, impact và expectation bằng ngôn ngữ người dùng.",
              why: "Bảo toàn voice-of-customer và communication lifecycle.",
              actors: ["Tenant", "Member", "Help desk"],
            },
            {
              id: "work-order",
              term: "Work Order",
              definition: "Đơn vị execution được triage, có scope, priority, assignee, tasks, safety, labor/material và acceptance.",
              why: "Là control boundary để giao việc, theo dõi SLA và cost.",
              actors: ["Facility manager", "Technician", "Vendor"],
              commonMistake: "Dùng request status In Progress như work order và mất triage/duplicate/approval logic.",
            },
          ],
          examples: [
            {
              title: "Ba tenant báo nóng",
              context: "Ba request trong 10 phút từ Suite 5A và 5B.",
              scenario: "Help desk liên kết ba request vào một incident AHU-05 và tạo một diagnostic work order, sau đó một repair work order cần vendor.",
              outcome: "Tenant nhận update riêng; execution/cost không bị nhân ba.",
            },
          ],
          relations: [
            { from: "ServiceRequest", to: "WorkOrder", kind: "fulfilled-by", explanation: "Many-to-many relation thể hiện công việc nào giải quyết request nào." },
            { from: "WorkOrder", to: "Asset", kind: "references", explanation: "Có thể bắt đầu từ location rồi identify asset sau diagnosis." },
          ],
          invariants: [
            "Đóng request chỉ khi resolution được communicate/accepted theo policy, không chỉ khi technician bấm complete.",
            "Completed work order phải có resolution code, completedAt và executor; regulated work có evidence bắt buộc.",
          ],
          lifecycle: [
            { state: "Requested", trigger: "User submit/alarm", businessMeaning: "Nhu cầu được ghi nhận." },
            { state: "Triaged", trigger: "Validate, classify, deduplicate", businessMeaning: "Xác định impact/priority/next action." },
            { state: "Planned & assigned", trigger: "Tạo work order", businessMeaning: "Scope và owner thực thi rõ." },
            { state: "In progress", trigger: "Check-in/start", businessMeaning: "Đang tiêu labor/material/downtime." },
            { state: "Completed & verified", trigger: "Work done + acceptance", businessMeaning: "Asset/service restored và requester được đóng loop." },
          ],
          metrics: [
            { name: "Mean time to acknowledge", formula: "avg(acknowledgedAt − requestedAt)", interpretation: "Tốc độ phản hồi ban đầu.", decision: "Help-desk staffing và alert routing.", caution: "Auto-ack không đồng nghĩa triage chất lượng." },
            { name: "Mean time to repair", formula: "avg(restoredAt − repairStartedAt)", interpretation: "Tốc độ khôi phục sau khi bắt đầu sửa.", decision: "Skill, spare parts, vendor strategy.", caution: "Nêu rõ waiting time có include hay exclude." },
          ],
          edgeCases: [
            { case: "Request spam/trùng lặp", risk: "Tạo nhiều WO và cost double-count.", handling: "Deduplicate thành incident/problem, giữ mọi requester subscription." },
          ],
          softwareModels: [
            {
              title: "Request-work mapping",
              language: "typescript",
              code: `interface RequestWorkLink {
  requestId: string;
  workOrderId: string;
  relation: "diagnoses" | "resolves" | "follow-up";
}

// Request lifecycle tối ưu communication.
// WorkOrder lifecycle tối ưu execution/control.`,
              explanation: "Hai aggregate có lifecycle độc lập nhưng liên kết traceable.",
            },
          ],
          quiz: [
            { id: "w06-l02-q1", prompt: "Có nên luôn tạo một Work Order cho mỗi Service Request không?", correctAnswer: "Không. Request cần triage; nhiều request có thể cùng một sự cố và một request có thể cần nhiều công việc.", explanation: "Tách demand intake khỏi execution unit giúp scale workflow." },
          ],
        }),
        defineLesson({
          id: "w06-l03",
          title: "Preventive maintenance, SLA và maintenance cost",
          durationMinutes: 65,
          summary: "Sinh việc chủ động theo time/meter/condition và đo reliability cùng service promise.",
          why: "Chỉ làm corrective maintenance dẫn đến downtime, chi phí khẩn cấp và trải nghiệm tenant kém; schedule sai lại tạo work vô ích.",
          concepts: [
            {
              id: "maintenance-strategy",
              term: "Maintenance strategy",
              definition: "Taxonomy gồm preventive theo lịch/meter, predictive theo condition và corrective sau failure.",
              why: "Strategy quyết định trigger, resource, spare part và metric phù hợp.",
              actors: ["Facility manager", "Reliability engineer"],
            },
            {
              id: "sla",
              term: "Service Level Agreement",
              definition: "Cam kết đo được về acknowledgement, attendance, restoration hoặc resolution theo priority và business calendar.",
              why: "Biến expectation thành timer có pause/escalation rõ ràng.",
              actors: ["Tenant", "Property manager", "Vendor"],
            },
          ],
          examples: [
            {
              title: "Bảo trì thang máy",
              context: "Lift phải kiểm tra mỗi 30 ngày hoặc 1.000 cycle, điều kiện nào đến trước.",
              scenario: "Meter đạt 1.000 cycle ngày 20 nên system sinh WO trước due-date lịch ngày 30; vendor check-in và ghi parts.",
              outcome: "Không sinh trùng WO ngày 30; next due tính từ completion/strategy policy.",
            },
          ],
          relations: [
            { from: "MaintenancePlan", to: "WorkOrder", kind: "generates", explanation: "Trigger policy materialize planned work." },
            { from: "WorkLog", to: "MaintenanceCost", kind: "generates", explanation: "Labor/material/service actual tạo operational cost evidence." },
          ],
          invariants: [
            "Cùng maintenance plan/trigger window chỉ sinh tối đa một active WO, nhờ idempotency key.",
            "SLA clock phải lưu calendar, pause reason và event log; không chỉ dueAt mutable.",
          ],
          lifecycle: [
            { state: "Planned", trigger: "Strategy approved", businessMeaning: "Có task template và trigger." },
            { state: "Due", trigger: "Calendar/meter/condition", businessMeaning: "Sinh work order idempotently." },
            { state: "Executed", trigger: "Tasks/evidence complete", businessMeaning: "Reset/advance maintenance basis." },
            { state: "Overdue", trigger: "Due date qua mà chưa complete", businessMeaning: "Reliability/compliance risk cần escalation." },
          ],
          metrics: [
            { name: "Preventive maintenance compliance", formula: "PM work completed on time / PM work due", interpretation: "Mức tuân thủ kế hoạch chủ động.", decision: "Capacity/vendor escalation.", caution: "Cancel/duplicate phải có reason và denominator policy." },
            { name: "First-time fix rate", formula: "work resolved không revisit trong window / eligible completed work", interpretation: "Chất lượng sửa chữa.", decision: "Training và spare-part readiness.", caution: "Định nghĩa revisit window theo asset class." },
          ],
          edgeCases: [
            { case: "Meter đọc lùi do thay đồng hồ", risk: "Trigger sai hoặc không bao giờ due.", handling: "Version meter, record rollover/replacement và dùng validated cumulative reading." },
          ],
          softwareModels: [
            {
              title: "Polymorphic maintenance trigger",
              language: "typescript",
              code: `type MaintenanceTrigger =
  | { kind: "calendar"; everyDays: number }
  | { kind: "meter"; meterCode: string; every: number }
  | { kind: "condition"; signal: string; threshold: number };

interface MaintenancePlan {
  assetId: string;
  triggers: MaintenanceTrigger[];
  dueRule: "first-trigger" | "all-triggers";
}`,
              explanation: "Discriminated union giữ interface chung nhưng mỗi trigger có data/invariant riêng.",
            },
          ],
          quiz: [
            { id: "w06-l03-q1", prompt: "Preventive plan có hai trigger calendar và meter nên sinh hai WO không?", correctAnswer: "Không mặc định. Nếu policy là điều kiện đến trước, materialization phải idempotent và một completion sẽ advance cả basis liên quan.", explanation: "Trigger là lý do due, không nhất thiết là identity của công việc." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Bạn tìm asset ở đâu và tìm các tenant bị ảnh hưởng bằng relation nào?",
        "Request close và Work Order complete khác nhau ở actor/invariant nào?",
        "SLA clock có pause khi chờ tenant access hay vẫn chạy? Policy được lưu ở đâu?",
      ],
      deliverable: "Model sự cố mất lạnh từ ba tenant request đến incident, diagnostic WO, vendor repair, parts, SLA và cost.",
      sourceSuggestions: [
        { label: "IFMA — Essentials of Facility Management", url: "https://www.ifma.org/professional-development/essentials-of-facility-management/" },
        { label: "IFMA — people, place and process", url: "https://www.ifma.org/about/what-is-fm/" },
      ],
    }),

    defineWeek({
      id: "week-07",
      number: 7,
      domain: "vendor-procurement",
      title: "Vendor, Contract & Procurement",
      subtitle: "Từ nhu cầu công việc đến cam kết mua, nhận hàng và thanh toán có kiểm soát",
      estimatedHours: 5,
      learningObjectives: [
        "Phân biệt vendor party, vendor profile, service contract và rate card.",
        "Mô tả procure-to-pay: requisition → approval → PO → receipt → invoice → payment.",
        "Thực hiện three-way match và ngăn duplicate invoice/payment.",
        "Đánh giá vendor theo SLA, quality, risk và total cost thay vì giá đơn thuần.",
      ],
      why:
        "Maintenance và operating expense đi qua vendor. Procurement controls bảo vệ budget, chất lượng dịch vụ và audit trail trước khi cash out.",
      lessons: [
        defineLesson({
          id: "w07-l01",
          title: "Vendor identity, capability và contract",
          durationMinutes: 55,
          summary: "Một Party trở thành vendor trong procurement context, kèm qualification và agreement theo property/service.",
          why: "Không phải mọi vendor được phép làm mọi loại việc tại mọi building; certificate, insurance và rate có hiệu lực theo thời gian.",
          concepts: [
            {
              id: "vendor-profile",
              term: "Vendor profile",
              definition: "Contextual role của Party gồm capability, service area, qualification, bank/tax reference và risk status.",
              why: "Party core có thể đồng thời là tenant/vendor; profile giữ rule procurement riêng.",
              actors: ["Procurement", "Facility manager", "AP"],
            },
            {
              id: "service-contract",
              term: "Service contract",
              definition: "Agreement quy định scope, site, term, rate, SLA, insurance, renewal và spend ceiling.",
              why: "Là nguồn kiểm tra entitlement/rate trước khi tạo PO hoặc dispatch work.",
              actors: ["Contract manager", "Vendor", "Property manager"],
            },
          ],
          examples: [
            {
              title: "Vendor HVAC theo vùng",
              context: "CoolAir được chứng nhận bảo trì chiller ở Building A, không ở Building B; insurance hết hạn 30/09.",
              scenario: "Dispatch ngày 01/10 bị block cho tới khi certificate mới được approved dù contract còn term.",
              outcome: "Eligibility là projection từ contract + site scope + qualification interval.",
            },
          ],
          relations: [
            { from: "Party", to: "VendorProfile", kind: "classified-as", explanation: "Profile thêm procurement behavior lên identity chung." },
            { from: "ServiceContract", to: "Property", kind: "references", explanation: "Contract scope có thể portfolio/property/building." },
          ],
          invariants: [
            "Vendor được dispatch regulated work chỉ khi qualification/insurance còn hiệu lực tại thời điểm làm.",
            "Rate dùng để approve phải trace về contract/rate-card version hoặc exception approval.",
          ],
          lifecycle: [
            { state: "Onboarding", trigger: "Vendor invited", businessMeaning: "Thu thập tax/bank/certificate." },
            { state: "Qualified", trigger: "Checks approved", businessMeaning: "Eligible theo capability/scope." },
            { state: "Active", trigger: "Contract effective", businessMeaning: "Có thể source/dispatch." },
            { state: "Suspended/expired", trigger: "Risk, certificate hoặc term", businessMeaning: "Chặn cam kết mới, giữ việc lịch sử." },
          ],
          metrics: [
            { name: "Qualified vendor coverage", formula: "critical service categories có ≥ N qualified vendors / all critical categories", interpretation: "Mức chống single-supplier risk.", decision: "Sourcing plan.", caution: "Vendor qualified nhưng không capacity không phải coverage thực." },
          ],
          edgeCases: [
            { case: "Vendor đổi tài khoản ngân hàng qua email", risk: "Payment fraud.", handling: "Tách bank-detail change workflow, maker-checker và out-of-band verification." },
          ],
          softwareModels: [
            {
              title: "Eligibility là rule projection",
              language: "pseudo",
              code: `eligible(vendor, job, at) =
  profile.activeAt(at)
  && capability.covers(job.trade)
  && contract.covers(job.propertyId, at)
  && certificates.requiredFor(job).allValidAt(at)
  && !riskHold.activeAt(at)`,
              explanation: "Không lưu isApproved toàn cục vì approval phụ thuộc job, site và thời điểm.",
            },
          ],
          quiz: [
            { id: "w07-l01-q1", prompt: "Vendor status Active có đủ để dispatch mọi work không?", correctAnswer: "Không; cần capability, site/contract scope, certificate, insurance, risk hold và hiệu lực tại thời điểm work.", explanation: "Eligibility là contextual projection, không phải global boolean." },
          ],
        }),
        defineLesson({
          id: "w07-l02",
          title: "Procure-to-pay và three-way match",
          durationMinutes: 70,
          summary: "Tách request chi tiêu, cam kết, bằng chứng nhận và nghĩa vụ thanh toán.",
          why: "PO không phải expense và vendor invoice không chứng minh hàng/dịch vụ đã nhận; từng artifact trả lời một control question.",
          concepts: [
            {
              id: "procure-to-pay",
              term: "Procure-to-pay lifecycle",
              definition: "Requisition → approval → purchase order → goods/service receipt → vendor invoice → matching → AP → payment.",
              why: "Cho biết lúc nào nhu cầu, commitment, expense/liability và cash thực sự phát sinh.",
              actors: ["Requester", "Approver", "Procurement", "AP", "Treasury"],
            },
            {
              id: "three-way-match",
              term: "Three-way match",
              definition: "So PO, receipt và invoice theo quantity, price, tax và tolerance trước khi approve AP.",
              why: "Ngăn trả cho hàng chưa nhận, price sai hoặc invoice trùng.",
              actors: ["AP", "Procurement", "Facility manager"],
            },
          ],
          examples: [
            {
              title: "Thay 10 bóng đèn, nhận 8",
              context: "PO 10 bóng × 1 triệu; site xác nhận nhận 8; vendor invoice đủ 10.",
              scenario: "Match chỉ approve 8 triệu hoặc hold 2 triệu chờ receipt/dispute theo tolerance.",
              outcome: "Commitment còn 2 triệu open; AP không thanh toán vượt evidence nhận hàng.",
              numbers: ["PO 10m", "Receipt 8m", "Invoice 10m", "Matched 8m"],
            },
          ],
          relations: [
            { from: "PurchaseRequisition", to: "PurchaseOrder", kind: "precedes", explanation: "Approval nhu cầu trước commitment với vendor." },
            { from: "PurchaseOrder", to: "Receipt", kind: "fulfilled-by", explanation: "Receipt ghi quantity/service accepted." },
            { from: "VendorInvoice", to: "AccountsPayable", kind: "generates", explanation: "Chỉ sau validation/match theo policy." },
          ],
          invariants: [
            "Invoice key vendor + invoice number + legal entity phải unique hoặc qua duplicate-review.",
            "Cumulative accepted receipt/invoice không vượt PO line ngoài tolerance/change-order được duyệt.",
          ],
          lifecycle: [
            { state: "Requested", trigger: "Requisition submit", businessMeaning: "Nêu why/cost center/budget, chưa cam kết vendor." },
            { state: "Committed", trigger: "PO issued", businessMeaning: "Encumber budget và tạo commercial commitment." },
            { state: "Received", trigger: "Goods/service accepted", businessMeaning: "Evidence economic activity/expense." },
            { state: "Matched", trigger: "Invoice passes controls", businessMeaning: "AP eligible for payment." },
            { state: "Paid", trigger: "Payment settle", businessMeaning: "Cash giảm và AP đóng." },
          ],
          metrics: [
            { name: "PO compliance", formula: "addressable spend có approved PO trước invoice / addressable spend", interpretation: "Mức mua hàng theo control process.", decision: "Policy training và maverick-spend intervention.", caution: "Emergency/non-addressable exceptions phải phân loại." },
            { name: "First-pass match rate", formula: "invoice match không exception lần đầu / matched invoices", interpretation: "Chất lượng PO/receipt/invoice data.", decision: "Cải thiện vendor và receiving process.", caution: "Rate cao do tolerance quá rộng cũng là risk." },
          ],
          edgeCases: [
            { case: "Emergency repair không có PO trước", risk: "Block hoạt động hoặc tạo uncontrolled spend.", handling: "Emergency workflow với after-the-fact approval, reason code và tighter review." },
          ],
          softwareModels: [
            {
              title: "Financial meaning theo artifact",
              language: "pseudo",
              code: `Requisition -> demand (no posting)
PurchaseOrder -> commitment / budget encumbrance
ServiceReceipt -> expense/accrual evidence
VendorInvoice -> accounts payable document
Payment -> cash settlement

match(poLine, receipts, invoiceLine, tolerancePolicy) -> MatchResult`,
              explanation: "Một PurchaseTransaction chung sẽ đánh mất boundary và thời điểm của từng nghĩa vụ.",
            },
          ],
          quiz: [
            { id: "w07-l02-q1", prompt: "PO 10 triệu có phải Expense 10 triệu chưa?", correctAnswer: "Chưa. PO là commitment; expense thường phát sinh khi goods/service được nhận theo accounting policy.", explanation: "Commitment, recognition, payable và cash là bốn lớp khác nhau." },
          ],
        }),
        defineLesson({
          id: "w07-l03",
          title: "Vendor performance, risk và contract renewal",
          durationMinutes: 55,
          summary: "Kết hợp time, quality, cost và compliance thành score có drill-down.",
          why: "Vendor rẻ nhất có thể tạo downtime và rework đắt hơn; score phải gắn với decision renewal/sourcing chứ không là vanity ranking.",
          concepts: [
            {
              id: "vendor-scorecard",
              term: "Vendor scorecard",
              definition: "Bộ metric versioned về SLA, quality, safety, compliance, invoice accuracy và total cost theo category/site.",
              why: "Hỗ trợ review, corrective action, sourcing và renewal dựa trên evidence.",
              actors: ["Procurement", "Facility manager", "Asset manager"],
            },
          ],
          examples: [
            {
              title: "Hai vendor vệ sinh",
              context: "Vendor A rẻ hơn 8% nhưng complaint rate gấp đôi và fail audit 2 lần; Vendor B đúng SLA 98%.",
              scenario: "Scorecard weight compliance như gate, quality 40%, service 30%, cost 30%.",
              outcome: "A không được auto-renew dù unit price thấp; team mở corrective plan hoặc tender.",
            },
          ],
          relations: [
            { from: "WorkOrder", to: "VendorScore", kind: "reported-through", explanation: "Execution evidence tạo service/quality metrics." },
            { from: "MatchException", to: "VendorScore", kind: "reported-through", explanation: "Invoice accuracy phản ánh process quality." },
          ],
          invariants: [
            "Scorecard phải hiển thị sample size và window; vendor có hai job không so ngang vendor có 2.000 job nếu thiếu confidence.",
            "Critical compliance breach không được bị average che khuất bởi giá tốt.",
          ],
          lifecycle: [
            { state: "Monitoring", trigger: "Contract active", businessMeaning: "Thu evidence liên tục." },
            { state: "Review due", trigger: "Quarter/renewal window", businessMeaning: "Score và incidents được xác nhận." },
            { state: "Corrective action", trigger: "Below threshold", businessMeaning: "Có owner, due date và evidence closure." },
            { state: "Renew/rebid/terminate", trigger: "Decision approved", businessMeaning: "Action thương mại theo risk/performance." },
          ],
          metrics: [
            { name: "SLA attainment", formula: "eligible jobs đạt target / eligible completed jobs", interpretation: "Độ tin cậy dịch vụ.", decision: "Service credit, corrective action, renewal.", caution: "Exclude/pause phải theo contract rule, không sửa tay denominator." },
            { name: "Total cost of service", formula: "invoice cost + internal handling + downtime + rework", interpretation: "Chi phí kinh tế rộng hơn unit price.", decision: "Source vendor tạo value tốt hơn.", caution: "Downtime attribution cần model minh bạch." },
          ],
          edgeCases: [
            { case: "Vendor mới chưa đủ sample", risk: "Score cực đoan từ một job.", handling: "Hiển thị provisional status/confidence và dùng onboarding thresholds riêng." },
          ],
          softwareModels: [
            {
              title: "Score không che rule gate",
              language: "formula",
              code: `eligibleForRenewal = noCriticalComplianceBreach

score =
  qualityScore * 0.40 +
  serviceScore * 0.30 +
  costScore * 0.30

decision = eligibleForRenewal ? evaluate(score, confidence) : "blocked"`,
              explanation: "Taxonomy tách hard control khỏi weighted preference.",
            },
          ],
          quiz: [
            { id: "w07-l03-q1", prompt: "Vì sao không nên average compliance breach vào tổng score?", correctAnswer: "Một vi phạm critical có thể là điều kiện loại bắt buộc; average có thể che risk bằng điểm cost/service cao.", explanation: "Hard invariant/gate và optimization score là hai abstraction khác nhau." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Eligibility vendor phụ thuộc những scope và interval nào?",
        "Sự kiện nào tạo commitment, expense, payable và cash out?",
        "Vendor score có sample size, confidence và compliance gate chưa?",
      ],
      deliverable: "Thiết kế procurement case sửa lift khẩn cấp từ requisition đến payment, gồm contract rate, certificate, partial receipt và invoice exception.",
      sourceSuggestions: [
        { label: "BOMA Foundations — contract management", url: "https://boma.org/education/courses/foundations-of-real-estate-management/" },
        { label: "Yardi Commercial — procurement workflows", url: "https://www.yardi.com/market/commercial/" },
      ],
    }),

    defineWeek({
      id: "week-08",
      number: 8,
      domain: "budget-reporting",
      title: "Budget, Actual, Forecast & Owner Reporting",
      subtitle: "Plan có version, actual có lineage và variance phải dẫn đến hành động",
      estimatedHours: 6,
      learningObjectives: [
        "Mô hình budget theo version, scenario, period, property, account và responsibility.",
        "Phân biệt budget, forecast, commitment, accrual và actual.",
        "Phân rã variance thành price, volume, timing và one-off.",
        "Thiết kế owner report có narrative, metric policy và drill-down về source.",
      ],
      why:
        "Owner không cần dump ledger; họ cần performance so với plan, nguyên nhân, forecast và quyết định. Tuy vậy mọi summary vẫn phải reconcile về financial truth.",
      lessons: [
        defineLesson({
          id: "w08-l01",
          title: "Budget cube và versioning",
          durationMinutes: 65,
          summary: "Budget là tập planning facts đa chiều, không phải cột budgetAmount trên account.",
          why: "Cùng một property có original budget, approved revision và rolling forecast; ghi đè sẽ mất accountability.",
          concepts: [
            {
              id: "budget-version",
              term: "Budget version / scenario",
              definition: "Immutable planning dataset cho một scope và horizon, có workflow Draft → Submitted → Approved → Locked; revision là version mới.",
              why: "Cho phép so actual với plan đã cam kết và đồng thời xem latest expectation.",
              actors: ["Property manager", "Owner", "FP&A"],
            },
            {
              id: "planning-fact",
              term: "Planning fact",
              definition: "Amount/quantity/rate theo period và dimension như property, space, account, department, vendor/category.",
              why: "Tách facts khỏi hierarchy để roll-up và scenario compare linh hoạt.",
              actors: ["FP&A", "Data engineer"],
            },
          ],
          examples: [
            {
              title: "Utilities budget theo driver",
              context: "Budget điện = occupied m² × kWh/m² × tariff thay vì nhập một total mơ hồ.",
              scenario: "Original giả định 8.000 m² occupied, 12 kWh/m², 3.000đ/kWh; forecast đổi occupancy lên 8.500 m² và tariff 3.200đ.",
              outcome: "Variance có thể giải thích volume và price riêng.",
              numbers: ["Original: 288m", "Forecast: 326,4m", "Delta: 38,4m"],
            },
          ],
          relations: [
            { from: "BudgetVersion", to: "PlanningFact", kind: "contains", explanation: "Version khóa một tập facts nhất quán." },
            { from: "PlanningFact", to: "DimensionMember", kind: "references", explanation: "Fact tham chiếu property/account/period/driver." },
          ],
          invariants: [
            "Approved/locked budget version không được update; revision clone/derive và có approval mới.",
            "Mỗi planning fact phải có currency, period và grain; FX policy rõ nếu consolidate.",
          ],
          lifecycle: [
            { state: "Draft", trigger: "Budget cycle mở", businessMeaning: "Team nhập driver và assumption." },
            { state: "Submitted", trigger: "Property manager gửi", businessMeaning: "Chờ owner review." },
            { state: "Approved & locked", trigger: "Owner phê duyệt", businessMeaning: "Baseline accountability." },
            { state: "Reforecast", trigger: "Assumption thay đổi", businessMeaning: "Latest expectation, không thay original." },
          ],
          metrics: [
            { name: "Budget coverage", formula: "account-period có approved facts / required account-period", interpretation: "Mức hoàn chỉnh trước approval.", decision: "Chặn submit hoặc yêu cầu assumption.", caution: "Zero plan khác missing plan." },
          ],
          edgeCases: [
            { case: "Property mua/bán giữa năm", risk: "Consolidated budget include cả năm trong khi ownership chỉ một phần.", handling: "Version ownership/reporting perimeter theo effective date và bridge like-for-like." },
          ],
          softwareModels: [
            {
              title: "Budget fact model",
              language: "typescript",
              code: `interface PlanningFact {
  versionId: string;
  period: string;
  propertyId: string;
  accountTag: string;
  amount: number;
  currency: string;
  driver?: { code: string; quantity: number; rate: number };
}`,
              explanation: "Fact table hỗ trợ thêm dimension mà không tạo cột budget cho từng domain object.",
            },
          ],
          quiz: [
            { id: "w08-l01-q1", prompt: "Tại sao rolling forecast không nên ghi đè approved budget?", correctAnswer: "Budget là baseline cam kết; forecast là latest expectation. Ghi đè làm mất variance/accountability và lịch sử assumption.", explanation: "Hai artifact phục vụ hai quyết định khác nhau." },
          ],
        }),
        defineLesson({
          id: "w08-l02",
          title: "Variance và forecast bridge",
          durationMinutes: 65,
          summary: "Biến Actual − Plan thành nguyên nhân và hành động thay vì tô đỏ một con số.",
          why: "Total variance nói có chênh lệch nhưng không nói do giá, lượng, timing hay sự kiện bất thường.",
          concepts: [
            {
              id: "variance-decomposition",
              term: "Variance decomposition",
              definition: "Phân rã chênh lệch thành price/rate, volume, mix, timing, scope và one-off với explanation owner.",
              why: "Mỗi driver dẫn tới action và forecast update khác nhau.",
              actors: ["Property manager", "FP&A", "Owner"],
            },
            {
              id: "actual-commitment-forecast",
              term: "Actual / Commitment / Forecast",
              definition: "Actual đã recognize; commitment là nghĩa vụ PO/contract chưa thành actual; forecast là estimate kỳ tương lai gồm known commitment và assumptions.",
              why: "Tránh tưởng còn nhiều budget vì invoice chưa đến dù PO đã cam kết.",
              actors: ["Budget owner", "Procurement", "Asset manager"],
            },
          ],
          examples: [
            {
              title: "Điện vượt budget 38,4 triệu",
              context: "Actual/forecast 8.500 m² × 12 kWh × 3.200đ so với budget 8.000 × 12 × 3.000đ.",
              scenario: "Volume variance = (8.500−8.000)×12×3.000 = 18m; rate variance = 8.500×12×(3.200−3.000)=20,4m.",
              outcome: "Leasing success giải thích volume; tariff contract giải thích price. Action khác nhau.",
              numbers: ["Volume +18m", "Rate +20,4m", "Total +38,4m"],
            },
          ],
          relations: [
            { from: "Variance", to: "Actual", kind: "derived-from", explanation: "Compare cùng dimensions/policy với baseline." },
            { from: "Forecast", to: "Commitment", kind: "derived-from", explanation: "Open PO/contracts là phần known của estimate." },
          ],
          invariants: [
            "Variance components phải reconcile về total variance trong rounding tolerance.",
            "Favorable/unfavorable phụ thuộc revenue/expense semantics, không chỉ dấu dương/âm.",
          ],
          lifecycle: [
            { state: "Detected", trigger: "Actual/forecast refresh", businessMeaning: "Variance vượt threshold." },
            { state: "Explained", trigger: "Owner gắn driver/narrative", businessMeaning: "Có nguyên nhân và evidence." },
            { state: "Actioned", trigger: "Mitigation/forecast approved", businessMeaning: "Decision có owner/due date." },
            { state: "Closed", trigger: "Action verified hoặc accepted", businessMeaning: "Learning đi vào cycle tiếp theo." },
          ],
          metrics: [
            { name: "Forecast accuracy", formula: "1 − |actual − prior forecast| / scale", interpretation: "Khả năng dự báo tại horizon xác định.", decision: "Cải thiện driver/model và attention.", caution: "Luôn ghi forecast vintage/horizon; tránh divide-by-small-number." },
            { name: "Budget utilization", formula: "(actual + committed) / approved budget", interpretation: "Mức ngân sách đã dùng hoặc bị ràng buộc.", decision: "Approve spend mới hoặc reallocate.", caution: "Không double-count receipt/invoice đã chuyển commitment thành actual." },
          ],
          edgeCases: [
            { case: "Invoice late làm actual thấp giả tạo", risk: "Báo favorable variance trong khi expense đã incurred.", handling: "Include accrual/estimate và show close quality." },
          ],
          softwareModels: [
            {
              title: "Bridge có component kiểm chứng",
              language: "typescript",
              code: `interface VarianceExplanation {
  period: string;
  dimensionKey: string;
  baselineAmount: number;
  actualOrForecastAmount: number;
  components: Array<{
    type: "price" | "volume" | "mix" | "timing" | "scope" | "one-off";
    amount: number;
    narrative: string;
    ownerId: string;
  }>;
}`,
              explanation: "Narrative gắn vào reconciled driver component thay vì comment rời trên report.",
            },
          ],
          quiz: [
            { id: "w08-l02-q1", prompt: "Vì sao actual + committed không được cộng ngây thơ?", correctAnswer: "Vì một phần commitment đã có receipt/invoice và trở thành actual; phải dùng open commitment còn lại để tránh double-count.", explanation: "Lifecycle transition cần giảm encumbrance khi actual được recognize." },
          ],
        }),
        defineLesson({
          id: "w08-l03",
          title: "Owner report: performance narrative có reconcile",
          durationMinutes: 65,
          summary: "Thiết kế report theo decision hierarchy: headline → driver → action → evidence.",
          why: "Ledger dump tối ưu completeness cho accountant, không tối ưu attention của owner; report tóm tắt lại không được biến thành một financial truth riêng.",
          concepts: [
            {
              id: "owner-report",
              term: "Owner reporting package",
              definition: "Bộ view định kỳ gồm executive summary, leasing/occupancy, NOI, budget variance, AR, operations, CapEx, forecast và actions.",
              why: "Kết nối vận hành property với outcome và quyết định của owner.",
              actors: ["Owner", "Property manager", "Asset manager"],
            },
            {
              id: "reporting-semantic-layer",
              term: "Reporting semantic layer",
              definition: "Versioned mappings từ ledger/domain facts sang business lines, metric definitions và stakeholder views.",
              why: "Một source fact có thể xuất hiện trong cash, NOI và owner report theo classification khác mà vẫn reconcile.",
              actors: ["Finance", "Data team", "Product engineer"],
            },
          ],
          examples: [
            {
              title: "Owner hỏi Expense tháng này tăng vì sao",
              context: "Ledger có 2.000 postings; cleaning +15%, electricity +10%, lift repair one-off 150 triệu.",
              scenario: "Report headline OpEx +12% vs budget, bridge ba driver, action renegotiate cleaning và insurance claim lift.",
              outcome: "Owner hiểu material drivers, vẫn drill-down được từ report line → account postings → invoice/work order.",
            },
          ],
          relations: [
            { from: "LedgerPosting", to: "ReportLine", kind: "reported-through", explanation: "Semantic mapping version quyết định inclusion." },
            { from: "DomainMetric", to: "OwnerReport", kind: "reported-through", explanation: "Occupancy/SLA/lease expiry bổ sung non-financial drivers." },
          ],
          invariants: [
            "Mọi financial report line phải reconcile về ledger scope với mapping/version/cutoff rõ.",
            "Report snapshot đã phát hành không tự đổi khi late data đến; restatement tạo version mới.",
          ],
          lifecycle: [
            { state: "Draft", trigger: "Period data cutoff", businessMeaning: "Automated sections + exceptions cần review." },
            { state: "Reviewed", trigger: "Property/finance sign-off", businessMeaning: "Narrative và reconciliation hoàn tất." },
            { state: "Published", trigger: "Owner delivery", businessMeaning: "Snapshot immutable, access controlled." },
            { state: "Restated", trigger: "Material correction", businessMeaning: "New version giải thích delta." },
          ],
          metrics: [
            { name: "Report timeliness", formula: "published within SLA periods / required reports", interpretation: "Tốc độ close và communicate.", decision: "Cải thiện data/approval bottleneck.", caution: "Nhanh nhưng unreconciled không phải chất lượng." },
            { name: "Action closure rate", formula: "due owner-report actions closed / actions due", interpretation: "Report có chuyển thành execution không.", decision: "Escalate recurring blockers.", caution: "Closure cần evidence, không chỉ status." },
          ],
          edgeCases: [
            { case: "Late vendor invoice material sau publish", risk: "Dashboard silently đổi và owner mất trust.", handling: "Áp materiality policy, publish restated version hoặc disclose next-period true-up." },
          ],
          softwareModels: [
            {
              title: "Report line mapping có version",
              language: "typescript",
              code: `interface ReportLineDefinition {
  code: string;
  label: string;
  mappingVersion: number;
  includeTags: string[];
  excludeTags: string[];
  presentation: "currency" | "percent" | "count";
  drilldownRoute: string;
}`,
              explanation: "Presentation là projection từ semantic layer, không phải bảng số được nhập tay độc lập.",
            },
          ],
          quiz: [
            { id: "w08-l03-q1", prompt: "Vì sao Owner Report không nên đồng nhất với Transaction/Ledger Report?", correctAnswer: "Owner cần asset performance, variance, forecast và actions; ledger cần complete postings. Owner report là projection có semantics nhưng phải reconcile về ledger/domain facts.", explanation: "Khác use case và abstraction, chung source-of-truth lineage." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Original budget và latest forecast có thể cùng tồn tại, so sánh bằng vintage nào?",
        "Variance được giải thích bằng driver hay chỉ có comment tổng quát?",
        "Owner report drill-down về ledger, invoice, lease và work order như thế nào?",
      ],
      deliverable: "Tạo owner pack một tháng gồm NOI, occupancy, AR aging, OpEx variance, CapEx/commitment, forecast và ba action có owner.",
      sourceSuggestions: [
        { label: "BOMA — Budgeting & owner reporting", url: "https://boma.org/education/career-paths/property-management/" },
        { label: "Yardi Commercial — analytics and reporting", url: "https://www.yardi.com/market/commercial/" },
      ],
    }),

    defineWeek({
      id: "week-09",
      number: 9,
      domain: "asset-investor",
      title: "Asset Management & Investor Perspective",
      subtitle: "Từ vận hành property đến performance, value và return trên vốn",
      estimatedHours: 6,
      learningObjectives: [
        "Phân biệt Property Management, Asset Management, Fund/Investor Management và accounting.",
        "Giải thích NOI, cap rate, valuation và value-creation plan trong cùng causal chain.",
        "Tách property performance khỏi investor-specific cash flow và ownership allocation.",
        "Thiết kế investor report là projection có lineage, không phải bản sao ledger.",
      ],
      why:
        "Investor hỏi vốn của họ sinh lời và rủi ro thế nào; asset manager hỏi asset có đạt business plan không; property manager hỏi vận hành tháng này ra sao. Một hệ thống cần liên kết ba góc nhìn mà không đồng nhất chúng.",
      lessons: [
        defineLesson({
          id: "w09-l01",
          title: "Ba tầng quản trị và decision rights",
          durationMinutes: 60,
          summary: "Đặt requirement đúng bounded context bằng actor, horizon và quyết định.",
          why: "Cùng từ Revenue hoặc Expense có scope khác nhau ở property, asset và investor layer.",
          concepts: [
            {
              id: "management-layers",
              term: "Property / Asset / Investment Management",
              definition: "Property Management vận hành lease, tenant, collection và OpEx; Asset Management tối ưu business plan/value; Investment Management phân bổ vốn và return theo vehicle/investor.",
              why: "Taxonomy làm rõ metric owner, time horizon và quyền phê duyệt.",
              actors: ["Property manager", "Asset manager", "Fund manager", "Investor"],
              variants: [
                { name: "Property view", definition: "Lease, billing, AR, service, budget và monthly NOI.", useWhen: "Điều hành tòa nhà.", contrastWith: "Không tự nói return của từng investor." },
                { name: "Asset view", definition: "Business plan, leasing strategy, CapEx, valuation và exit readiness.", useWhen: "Tối ưu giá trị tài sản.", contrastWith: "Không phải journal-entry view." },
                { name: "Investor view", definition: "Contribution, distribution, NAV share, return và risk theo ownership terms.", useWhen: "Đánh giá khoản đầu tư.", contrastWith: "Hai investor có thể có return khác nhau trên cùng asset." },
              ],
            },
          ],
          examples: [
            {
              title: "Một repair, ba góc nhìn",
              context: "Thay chiller 5 tỷ làm giảm downtime và cho phép tăng rent.",
              scenario: "Property team quản work/vendor; asset manager phê CapEx và đo rent uplift/value; investor nhìn capital call, cash distribution và IRR.",
              outcome: "Cùng initiative có IDs liên kết nhưng artifacts/metrics thuộc ba context khác nhau.",
            },
          ],
          relations: [
            { from: "PropertyOperatingPlan", to: "AssetBusinessPlan", kind: "reported-through", explanation: "Kế hoạch vận hành là một phần value-creation plan." },
            { from: "Asset", to: "InvestmentVehicle", kind: "references", explanation: "Ownership interest có effective dates và percentages/terms." },
          ],
          invariants: [
            "Actor visibility không được mã hóa bằng isInvestorTransaction; dùng reporting classification + ownership entitlement + access policy.",
            "Property identity, legal owner và reporting asset có thể khác scope; relation phải effective-dated.",
          ],
          lifecycle: [
            { state: "Acquire", trigger: "Investment close", businessMeaning: "Thiết lập basis, ownership và business plan." },
            { state: "Operate & improve", trigger: "Asset hold period", businessMeaning: "Property execution tạo NOI/value outcomes." },
            { state: "Revalue", trigger: "Periodic valuation", businessMeaning: "Cập nhật NAV/unrealized performance." },
            { state: "Exit", trigger: "Disposition", businessMeaning: "Realize value và distribute proceeds." },
          ],
          metrics: [
            { name: "Business-plan milestone attainment", formula: "weighted completed milestones / due milestones", interpretation: "Tiến độ value-creation initiatives.", decision: "Escalate CapEx/leasing blockers.", caution: "Activity completion không đảm bảo financial outcome." },
          ],
          edgeCases: [
            { case: "Property manager cũng là related-party vendor", risk: "Conflict và fee transparency.", handling: "Giữ party roles riêng, related-party flag, approval và investor disclosure policy." },
          ],
          softwareModels: [
            {
              title: "Contextual roles thay boolean",
              language: "typescript",
              code: `interface PartyRoleAssignment {
  partyId: string;
  contextType: "property" | "asset" | "vehicle";
  contextId: string;
  role: "property-manager" | "asset-manager" | "owner" | "investor";
  validFrom: string;
  validTo?: string;
}`,
              explanation: "Một Party có thể giữ nhiều role theo context và thời gian; authorization/reporting dùng assignment này.",
            },
          ],
          quiz: [
            { id: "w09-l01-q1", prompt: "Investor Expense có nên là một transaction type riêng không?", correctAnswer: "Không mặc định. Expense có accounting/operating classification; investor visibility và allocation là reporting/ownership projection riêng.", explanation: "Tách classification axes giúp một fact phục vụ nhiều stakeholder mà không nhân bản." },
          ],
        }),
        defineLesson({
          id: "w09-l02",
          title: "NOI → Cap rate → Value và value-creation plan",
          durationMinutes: 70,
          summary: "Nối operational drivers tới valuation nhưng công bố assumption và độ nhạy.",
          why: "Một thay đổi nhỏ ở stabilized NOI hoặc exit cap rate có thể tạo chênh lệch value lớn; dashboard không nên trình bày valuation như fact chắc chắn.",
          concepts: [
            {
              id: "cap-rate",
              term: "Capitalization rate",
              definition: "Tỷ suất liên hệ stabilized annual NOI với asset value; direct-cap approximation: Value = NOI / Cap rate.",
              why: "Là ngôn ngữ nhanh để so yield/risk và kiểm tra valuation commercial property.",
              actors: ["Asset manager", "Valuer", "Investor"],
              commonMistake: "Dùng NOI một tháng ×12 không normalize vacancy, one-off và stabilization.",
            },
            {
              id: "value-creation-plan",
              term: "Value-creation plan",
              definition: "Danh mục initiative có hypothesis nối action → operational driver → NOI/cash flow → value, cùng cost, timing và risk.",
              why: "Biến strategy thành testable causal model thay vì danh sách project.",
              actors: ["Asset manager", "Property manager", "Investor committee"],
            },
          ],
          examples: [
            {
              title: "Giữ chân tenant tăng value",
              context: "Initiative cải tạo lobby 2 tỷ dự kiến tăng stabilized NOI 600 triệu/năm nhờ occupancy/rent.",
              scenario: "Ở cap rate 8%, gross value uplift xấp xỉ 7,5 tỷ trước CapEx/fees/risk; ở 9% chỉ 6,67 tỷ.",
              outcome: "Investment memo hiển thị sensitivity và lead indicators lease renewal, không chỉ một ROI point estimate.",
              numbers: ["600m / 8% = 7,5bn", "600m / 9% = 6,67bn", "CapEx 2bn"],
            },
          ],
          relations: [
            { from: "StabilizedNOI", to: "Lease/Occupancy/OpEx drivers", kind: "derived-from", explanation: "Operational assumptions tạo normalized income." },
            { from: "IndicatedValue", to: "StabilizedNOI", kind: "derived-from", explanation: "Áp cap-rate/valuation method và scenario." },
          ],
          invariants: [
            "Valuation result phải lưu valuation date, method, NOI basis, cap rate/discount assumptions và scenario.",
            "Unrealized valuation change không được trộn với cash distribution.",
          ],
          lifecycle: [
            { state: "Underwritten", trigger: "Acquisition/business plan", businessMeaning: "Base/upside/downside assumptions." },
            { state: "Executing", trigger: "Initiatives funded", businessMeaning: "Track cost, milestone và leading driver." },
            { state: "Stabilized", trigger: "Target operational state", businessMeaning: "Normalize NOI cho valuation." },
            { state: "Re-underwritten", trigger: "Material market/asset change", businessMeaning: "New forecast version, không rewrite original thesis." },
          ],
          metrics: [
            { name: "Cap rate", formula: "Stabilized annual NOI / Asset value", interpretation: "Income yield implicit của asset.", decision: "Compare pricing/risk và scenario value.", caution: "NOI definition và forward/trailing basis phải tương thích." },
            { name: "Value variance", formula: "Current indicated value − underwritten value", interpretation: "Thay đổi kỳ vọng giá trị.", decision: "Hold/sell/refinance/reinvest.", caution: "Bridge NOI effect, cap-rate effect và scope/FX riêng." },
          ],
          edgeCases: [
            { case: "Negative/near-zero NOI", risk: "Direct cap tạo value vô nghĩa.", handling: "Dùng DCF/cost/comparable method phù hợp và disclose stabilization path." },
          ],
          softwareModels: [
            {
              title: "Valuation scenario là first-class model",
              language: "typescript",
              code: `interface DirectCapScenario {
  asOf: string;
  name: "downside" | "base" | "upside";
  annualNoi: number;
  capRate: number;
  noiDefinitionVersion: number;
}

const indicatedValue = (s: DirectCapScenario) => s.annualNoi / s.capRate;`,
              explanation: "Kết quả không tách khỏi assumption; UI có thể dựng sensitivity table.",
            },
          ],
          quiz: [
            { id: "w09-l02-q1", prompt: "NOI tăng 10% có luôn làm asset value tăng đúng 10% không?", correctAnswer: "Chỉ trong direct-cap đơn giản khi cap rate và mọi assumption khác giữ nguyên; thực tế risk/cap rate, timing và CapEx cũng thay đổi.", explanation: "Valuation là model theo scenario, không phải phép nhân chắc chắn." },
          ],
        }),
        defineLesson({
          id: "w09-l03",
          title: "Investor cash flow, ownership và performance ≠ ledger",
          durationMinutes: 70,
          summary: "Phân bổ cash/value theo ownership terms rồi tính return theo dated cash flows.",
          why: "Ledger ghi sự kiện của legal entity; investor performance phụ thuộc contribution, distribution, ownership period, fee và waterfall của riêng investor.",
          concepts: [
            {
              id: "investor-performance",
              term: "Investor performance",
              definition: "Return của một investor từ dated contributions, distributions và residual value/NAV theo entitlement.",
              why: "Cùng asset nhưng entry date, share class và waterfall khác nhau tạo return khác nhau.",
              actors: ["Investor", "Fund administrator", "Asset manager"],
            },
            {
              id: "ledger-vs-performance",
              term: "Ledger truth vs performance projection",
              definition: "Ledger bảo toàn double-entry theo entity/account/period; performance engine chọn và phân bổ economic cash flows theo ownership terms.",
              why: "Investor report cần reconcile nhưng không được giả vờ mọi journal là investor cash flow.",
              actors: ["Accountant", "Fund administrator", "Investor"],
              commonMistake: "Tính IRR từ mọi cash in/out trong bank account property, bao gồm tenant deposit và loan draw.",
            },
          ],
          examples: [
            {
              title: "Hai investor, một property",
              context: "A góp 60 tỷ ngày 01/01, B góp 40 tỷ ngày 01/07; asset phân phối 10 tỷ cuối năm theo weighted ownership terms.",
              scenario: "Không thể lấy 60/40 tĩnh nếu agreement tính preferred return/time-weighted capital trước promote.",
              outcome: "Allocation engine đọc ownership/waterfall effective terms; ledger distribution posting vẫn là source evidence.",
            },
          ],
          relations: [
            { from: "LedgerPosting", to: "InvestorCashFlow", kind: "reported-through", explanation: "Classification + allocation tạo investor-specific projection." },
            { from: "OwnershipInterest", to: "DistributionAllocation", kind: "generates", explanation: "Terms/effective period quyết định entitlement." },
            { from: "IRR/EquityMultiple", to: "InvestorPerformanceInput", kind: "derived-from", explanation: "Dated cash flows và terminal valuation cùng tạo performance metrics." },
          ],
          invariants: [
            "Σ investor allocations + retained/unallocated amount phải reconcile với distributable cash/value pool.",
            "Mọi performance metric phải nêu gross/net-of-fee, realized/unrealized, valuation date và currency.",
          ],
          lifecycle: [
            { state: "Subscribed/committed", trigger: "Investment agreement", businessMeaning: "Cam kết vốn, chưa nhất thiết cash in." },
            { state: "Contributed", trigger: "Capital call funded", businessMeaning: "Investor cash out và vehicle equity/cash tăng." },
            { state: "Distributed", trigger: "Distribution paid", businessMeaning: "Investor nhận cash theo allocation." },
            { state: "Valued", trigger: "NAV close", businessMeaning: "Thêm residual unrealized value cho performance as-of." },
            { state: "Exited", trigger: "Final distribution", businessMeaning: "Return phần lớn/hoàn toàn realized." },
          ],
          metrics: [
            { name: "Equity multiple", formula: "(Cumulative distributions + residual NAV) / Invested capital", interpretation: "Mỗi đồng vốn tạo bao nhiêu value, không xét timing.", decision: "So tổng value creation.", caution: "Nêu gross/net và NAV methodology." },
            { name: "IRR", formula: "Discount rate làm NPV của dated investor cash flows = 0", interpretation: "Annualized money-weighted return có xét timing.", decision: "So target/underwriting và các investment.", caution: "IRR có thể nhạy với timing, multiple roots và không nói scale." },
          ],
          edgeCases: [
            { case: "Ownership transfer giữa kỳ", risk: "Phân phối theo current share cho cả period.", handling: "Effective-dated interests và event-specific record date/allocation policy." },
          ],
          softwareModels: [
            {
              title: "Investor projection có lineage",
              language: "typescript",
              code: `type ISO4217 = "VND" | "USD";

interface Money {
  minorUnits: bigint;
  currency: ISO4217;
}

interface InvestorCashFlow {
  investorId: string;
  vehicleId: string;
  date: string;
  type: "contribution" | "distribution" | "fee";
  amount: Money; // signed: investor inflow positive, outflow negative
  sourcePostingIds: string[];
  allocationRuleVersion: number;
}

interface TerminalValuation {
  investorId: string;
  vehicleId: string;
  asOfDate: string;
  residualValue: Money;
  valuationMethod: "direct-cap" | "dcf" | "appraisal";
  sourceValuationId: string;
}

type InvestorPerformanceInput =
  | { kind: "cash-flow"; value: InvestorCashFlow }
  | { kind: "terminal-valuation"; value: TerminalValuation };
`,
              explanation: "Cash flow thực nhận/chi được tách khỏi terminal valuation chưa realized. Cả hai dùng Money có currency và lineage riêng, nên performance engine không biến NAV ước tính thành cash giả.",
            },
          ],
          quiz: [
            { id: "w09-l03-q1", prompt: "Vì sao investor performance report không thể chỉ là filter ledger theo investorId?", correctAnswer: "Ledger theo legal entity/account; investor flow còn cần ownership terms, allocations, fees, dates và residual NAV. Projection phải reconcile nhưng có semantics riêng.", explanation: "Performance engine và accounting ledger là bounded contexts liên kết, không đồng nhất." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Requirement này phục vụ quyết định của property manager, asset manager hay investor?",
        "Valuation đang dùng NOI nào, cap rate nào và scenario nào?",
        "Investor cash flow reconcile về ledger pool và ownership rule ra sao?",
      ],
      deliverable: "Lập asset dashboard có NOI bridge, lease expiry, CapEx initiative, direct-cap sensitivity và investor-specific cash-flow return.",
      sourceSuggestions: [
        { label: "RICS — Global Asset Management", url: "https://academy.rics.org/web-classes/valuation/asset-management-tools-techniques-and-practices-3-part-series" },
        { label: "RICS — Commercial Real Estate & Investment fundamentals", url: "https://www.rics.org/training-events/online-training/on-demand/certificate-in-commercial-real-estate" },
      ],
    }),

    defineWeek({
      id: "week-10",
      number: 10,
      domain: "coworking",
      title: "Coworking: Membership, Booking & Credits",
      subtitle: "Flex product bán quyền và entitlement linh hoạt thay vì chỉ bán diện tích theo lease dài hạn",
      estimatedHours: 6,
      learningObjectives: [
        "Phân biệt member, company/account, membership, plan, contract và entitlement.",
        "Mô hình hot desk, dedicated desk, private office và meeting room qua capability chung.",
        "Xử lý booking hold, confirmation, check-in, cancellation, no-show và conflict.",
        "Thiết kế package/credit ledger, usage charge, access và recurring billing có hiệu lực thời gian.",
      ],
      why:
        "Coworking kết hợp subscription, reservation, access và usage billing ở granularity giờ/ngày/seat. Ép mọi thứ vào Lease hoặc Invoice sẽ làm inventory và entitlement khó mở rộng.",
      lessons: [
        defineLesson({
          id: "w10-l01",
          title: "Member, membership, plan và entitlement",
          durationMinutes: 65,
          summary: "Tách ai sử dụng, ai trả tiền, họ mua sản phẩm nào và quyền nào được cấp.",
          why: "Một company trả tiền cho 20 member; plan có thể đổi nhưng entitlement của kỳ đã cấp cần audit được.",
          concepts: [
            {
              id: "membership",
              term: "Membership",
              definition: "Subscription/contractual relationship gắn account/member với plan, term, billing cadence và status.",
              why: "Là nguồn sinh recurring charge và entitlement theo kỳ.",
              actors: ["Community manager", "Member", "Billing team"],
            },
            {
              id: "entitlement",
              term: "Entitlement",
              definition: "Quyền cụ thể có hiệu lực: access location, book resource class, dùng quota/discount hoặc assigned desk.",
              why: "Plan là catalog/template; entitlement là quyền runtime có thể kiểm tra và version.",
              actors: ["Access system", "Booking engine", "Member"],
              commonMistake: "Check planName='Premium' ở mọi service thay vì policy/entitlement có type và interval.",
            },
          ],
          examples: [
            {
              title: "Company plan cho 20 nhân viên",
              context: "Acme mua 10 hot-desk access và 40 meeting-room credits/tháng cho roster tối đa 20 member.",
              scenario: "Account là payer; 20 member có access identity; concurrent hot-desk entitlement giới hạn 10; credit wallet thuộc company.",
              outcome: "Không tạo 20 lease; runtime policy kiểm quota/concurrency và billing về một account.",
              numbers: ["20 members", "10 concurrent desks", "40 room credits/month"],
            },
          ],
          relations: [
            { from: "Membership", to: "PlanVersion", kind: "references", explanation: "Membership snapshot commercial terms từ plan version đã chọn." },
            { from: "Membership", to: "EntitlementGrant", kind: "generates", explanation: "Activation/period renewal materialize runtime rights." },
            { from: "Account", to: "Member", kind: "contains", explanation: "Roster relation có role và validity, không ownership identity." },
          ],
          invariants: [
            "Plan catalog change không hồi tố membership/entitlement đã xác nhận nếu không có migration/amendment.",
            "Membership active không tự động cho mọi access; authorization dựa trên active entitlement, site calendar và policy.",
          ],
          lifecycle: [
            { state: "Pending", trigger: "Signup/contract chưa đủ payment/approval", businessMeaning: "Chưa cấp full entitlement." },
            { state: "Active", trigger: "Start condition đạt", businessMeaning: "Billing và grants hiệu lực." },
            { state: "Paused", trigger: "Approved freeze", businessMeaning: "Billing/access behavior theo pause policy." },
            { state: "Cancelled/expired", trigger: "Notice hoặc term end", businessMeaning: "Không grant kỳ mới; close usage/credit." },
          ],
          metrics: [
            { name: "Active memberships", formula: "count membership active trong interval theo plan/location", interpretation: "Subscription base tạo recurring revenue.", decision: "Capacity và retention.", caution: "Count membership khác count active members và contracted desks." },
          ],
          edgeCases: [
            { case: "Member chuyển từ company này sang company khác", risk: "Mất booking history hoặc dùng credit sai account.", handling: "Giữ Person identity, end roster relation cũ, tạo relation mới; booking giữ billed account snapshot." },
          ],
          softwareModels: [
            {
              title: "Plan → grant → authorization",
              language: "typescript",
              code: `type Entitlement =
  | { kind: "site-access"; locationIds: string[] }
  | { kind: "booking"; resourceClass: string; maxConcurrent: number }
  | { kind: "credits"; walletId: string; unitsPerPeriod: number }
  | { kind: "assignment"; resourceId: string };

interface EntitlementGrant {
  membershipId: string;
  entitlement: Entitlement;
  validFrom: string;
  validTo: string;
}`,
              explanation: "Polymorphism giữ authorization interface chung nhưng data riêng theo loại quyền.",
            },
          ],
          quiz: [
            { id: "w10-l01-q1", prompt: "Vì sao Plan và Entitlement không phải một object?", correctAnswer: "Plan là catalog/template thương mại có version; entitlement là quyền runtime cụ thể được grant cho account/member trong interval.", explanation: "Tách definition khỏi instantiation giúp thay plan mà không làm quyền lịch sử đổi theo." },
          ],
        }),
        defineLesson({
          id: "w10-l02",
          title: "Resource inventory và booking lifecycle",
          durationMinutes: 70,
          summary: "Đặt chỗ an toàn dưới concurrency bằng hold, allocation và policy.",
          why: "Availability check rồi insert không atomic sẽ double-book; booking còn cần cancellation, no-show và capacity semantics khác theo resource type.",
          concepts: [
            {
              id: "bookable-resource",
              term: "Bookable resource",
              definition: "Resource hoặc resource pool có availability calendar, capacity, booking policy và allocation strategy.",
              why: "Hot desk có thể book theo pool; dedicated desk theo exact resource; meeting room theo exclusive time interval.",
              actors: ["Member", "Community manager", "Booking engine"],
              variants: [
                { name: "Exact resource", definition: "Chọn Desk D-12/Room R-3 cụ thể.", useWhen: "Assignment, wayfinding hoặc exclusive resource.", contrastWith: "Pool booking chỉ cần resource class." },
                { name: "Pooled capacity", definition: "Reserve một quantity trong pool, allocate exact resource sau.", useWhen: "Hot desk/flexible inventory.", contrastWith: "Không khóa ID cụ thể sớm." },
              ],
            },
            {
              id: "booking-hold",
              term: "Booking hold",
              definition: "Reservation tạm thời có expiry để bảo vệ capacity trong lúc checkout/approval.",
              why: "Giải quyết concurrency mà không giữ slot vô hạn khi user bỏ flow.",
              actors: ["Booking engine", "Member"],
            },
          ],
          examples: [
            {
              title: "Hai người đặt phòng cuối cùng",
              context: "Room Lotus trống 14:00–15:00; hai request đến gần đồng thời.",
              scenario: "Transaction/exclusion constraint chỉ tạo một active hold; request còn lại nhận conflict hoặc waitlist.",
              outcome: "Hold expire sau 5 phút nếu không confirm; capacity tự trở lại mà không manual cleanup.",
            },
          ],
          relations: [
            { from: "Booking", to: "BookableResource", kind: "references", explanation: "Exact hoặc allocation từ pool." },
            { from: "Booking", to: "Entitlement/Credit", kind: "references", explanation: "Booking tham chiếu quyền sử dụng hoặc nguồn credit để authorization/funding; entitlement không phải bên thực hiện booking." },
          ],
          invariants: [
            "Tổng active hold + confirmed allocation không vượt capacity resource-time.",
            "Idempotency key ngăn retry tạo nhiều booking/charge cho cùng intent.",
          ],
          lifecycle: [
            { state: "Held", trigger: "Availability reserve atomically", businessMeaning: "Capacity tạm khóa đến expiresAt." },
            { state: "Confirmed", trigger: "Entitlement/payment/approval đạt", businessMeaning: "Reservation cam kết." },
            { state: "Checked-in", trigger: "Arrival evidence", businessMeaning: "Bắt đầu actual use/access." },
            { state: "Completed", trigger: "End/use complete", businessMeaning: "Finalize usage/overage." },
            { state: "Cancelled/No-show", trigger: "Cancel hoặc grace period qua", businessMeaning: "Áp release/refund/penalty policy." },
          ],
          metrics: [
            { name: "Booking conversion", formula: "confirmed bookings / valid booking intents", interpretation: "Khả năng chuyển demand thành reservation.", decision: "UX, pricing, capacity expansion.", caution: "Retry/bot phải deduplicate intent." },
            { name: "No-show rate", formula: "eligible no-shows / confirmed bookings", interpretation: "Capacity bị khóa mà không dùng.", decision: "Waitlist, reminder, penalty.", caution: "Check-in source/grace period cần đáng tin." },
          ],
          edgeCases: [
            { case: "Booking lặp hàng tuần, một occurrence đổi giờ", risk: "Update cả series hoặc detach sai.", handling: "Series rule + materialized occurrences + exception override có lineage." },
          ],
          softwareModels: [
            {
              title: "Capacity ledger theo interval",
              language: "pseudo",
              code: `reserve(resourceOrPool, interval, quantity, idempotencyKey):
  begin transaction
  expireStaleHolds(interval)
  used = sum(activeAllocations.overlap(interval).quantity)
  assert used + quantity <= effectiveCapacity(interval)
  insert Hold(expiresAt, idempotencyKey)
  commit`,
              explanation: "Availability và reserve nằm trong cùng consistency boundary; UI check chỉ là preview.",
            },
          ],
          quiz: [
            { id: "w10-l02-q1", prompt: "Check availability ở API A rồi tạo booking ở API B có đủ chống double-book không?", correctAnswer: "Không nếu không có atomic reservation/constraint; capacity có thể đổi giữa check và insert.", explanation: "Availability là query; booking confirmation là command cần concurrency control." },
          ],
        }),
        defineLesson({
          id: "w10-l03",
          title: "Credits, usage billing và access synchronization",
          durationMinutes: 70,
          summary: "Dùng ledger cho quyền tiêu thụ, ghi usage bất biến và đồng bộ access bằng event.",
          why: "Một balance mutable không giải thích được credit đến từ đâu, hết hạn khi nào, booking nào tiêu và refund nào hoàn lại.",
          concepts: [
            {
              id: "credit-ledger",
              term: "Credit ledger",
              definition: "Sổ các grant, consume, release, expire và adjustment entry theo measurement unit hoặc currency-like type, từ đó derive balance.",
              why: "Audit được package quota, concurrent booking và refund/reversal.",
              actors: ["Member", "Billing team", "Support"],
            },
            {
              id: "usage-record",
              term: "Usage record",
              definition: "Evidence bất biến về consumption có quantity, unit, service period, resource, source và pricing status.",
              why: "Tách việc đã dùng khỏi cách charge; reprice/rebill không làm mất usage truth.",
              actors: ["Billing engine", "Community manager"],
            },
          ],
          examples: [
            {
              title: "Đặt phòng bằng credit và dùng quá giờ",
              context: "Booking 2 giờ giữ 4 credits; member dùng thêm 30 phút giá 500.000đ/giờ.",
              scenario: "Confirm consume/earmark 4 credits; completion tạo usage 2,5 room-hour; overage 0,5 giờ sinh charge 250.000đ.",
              outcome: "Credit balance, usage và invoice line trace được độc lập; cancellation có reversal entries thay vì cộng balance tùy tiện.",
              numbers: ["4 credits", "0,5h overage", "250.000đ charge"],
            },
          ],
          relations: [
            { from: "MembershipPeriod", to: "CreditGrant", kind: "generates", explanation: "Mỗi kỳ active cấp quota theo plan version." },
            { from: "Booking/Usage", to: "CreditConsumption", kind: "generates", explanation: "Consumption reference source intent/record." },
            { from: "UsageRecord", to: "ChargeOccurrence", kind: "generates", explanation: "Pricing policy tính included/overage amount." },
            { from: "EntitlementEvent", to: "AccessCredential", kind: "reported-through", explanation: "Integration projection cấp/thu hồi access." },
          ],
          invariants: [
            "Credit entry bất biến; correction dùng reversal/adjustment reference entry gốc.",
            "Không trộn credit types/units hoặc transfer giữa account nếu policy không cho phép.",
            "Access projection phải idempotent và có reconciliation vì external controller có thể offline.",
          ],
          lifecycle: [
            { state: "Granted", trigger: "Membership period active", businessMeaning: "Credit có expiry và source." },
            { state: "Reserved", trigger: "Booking confirmed", businessMeaning: "Ngăn double-spend trong future booking." },
            { state: "Consumed", trigger: "Usage/cancellation cutoff", businessMeaning: "Finalize spend." },
            { state: "Released/expired", trigger: "Cancel hợp lệ hoặc period end", businessMeaning: "Trả lại hoặc đóng quyền theo rule." },
          ],
          metrics: [
            { name: "Credit breakage", formula: "expired unused credits / granted credits", interpretation: "Phần entitlement không được sử dụng.", decision: "Plan design và member success.", caution: "Breakage revenue recognition tùy accounting/legal policy." },
            { name: "Overage revenue", formula: "Σ charges từ usage vượt included entitlement", interpretation: "Monetization ngoài subscription.", decision: "Package size và pricing.", caution: "Không khuyến khích overage do UX gây nhầm." },
          ],
          edgeCases: [
            { case: "Booking tháng sau dùng credit tháng này", risk: "Credit hết hạn trước service date hoặc bị double-spend.", handling: "Policy rõ reserve-at-booking vs consume-at-service; reservation ledger giữ expiry compatibility." },
          ],
          softwareModels: [
            {
              title: "Credit balance là fold của immutable entries",
              language: "typescript",
              code: `interface CreditEntry {
  walletId: string;
  type: "grant" | "reserve" | "consume" | "release" | "expire" | "adjust";
  availableDelta: number;
  reservedDelta: number;
  consumedDelta: number;
  expiredDelta: number;
  occurredAt: string;
  expiresAt?: string;
  sourceType: "membership" | "booking" | "support";
  sourceId: string;
  reversesEntryId?: string;
}

interface CreditPosition {
  available: number;
  reserved: number;
  consumed: number;
  expired: number;
}

function foldPosition(entries: CreditEntry[]): CreditPosition {
  return entries.reduce((position, entry) => ({
    available: position.available + entry.availableDelta,
    reserved: position.reserved + entry.reservedDelta,
    consumed: position.consumed + entry.consumedDelta,
    expired: position.expired + entry.expiredDelta,
  }), { available: 0, reserved: 0, consumed: 0, expired: 0 });
}

// Invariant: available + reserved + consumed + expired
// === grants + signed adjustments.`,
              explanation: "Delta theo bucket định nghĩa rõ reserve/consume/release, giữ invariant và audit tốt hơn một wallet.balance mutable.",
            },
          ],
          quiz: [
            { id: "w10-l03-q1", prompt: "Vì sao không chỉ lưu creditBalance trên Membership?", correctAnswer: "Balance mutable không cho biết grant, reserve, consume, expire và reversal nào tạo số hiện tại; ledger entries cho audit và chống double-spend.", explanation: "Balance là projection, entries mới là domain history." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Account payer, member user, membership và entitlement đang tách ở đâu?",
        "Booking pooled desk khác exact desk assignment thế nào?",
        "Credit được reserve hay consume ở mốc nào, và access controller được reconcile ra sao?",
      ],
      deliverable: "Model company membership 20 người với 10 concurrent hot desks, 40 room credits, booking no-show, overage và access revocation.",
      sourceSuggestions: [
        { label: "OfficeRnD Help Center — Memberships, Contracts, Bookings and Billing", url: "https://help.officernd.com/" },
        { label: "OfficeRnD — Resources", url: "https://help.officernd.com/en/articles/313572-flex-resources-start-here" },
      ],
    }),

    defineWeek({
      id: "week-11",
      number: 11,
      domain: "flex-metrics",
      title: "Flex-space Metrics & Unit Economics",
      subtitle: "Đo supply, demand, usage và revenue trên cùng resource-time nhưng không trộn semantics",
      estimatedHours: 6,
      learningObjectives: [
        "Tính desk/private-office occupancy với prorated available và occupied resource.",
        "Phân biệt contracted occupancy, booking utilization, actual presence và revenue occupancy.",
        "Đo MRR, yield, RevPAW, booking revenue trên mỗi resource-hour, churn và contribution margin theo cohort/location.",
        "Thiết kế metric dictionary, lineage, quality và decision threshold cho dashboard flex.",
      ],
      why:
        "Flex operator phải tối ưu đồng thời subscription, capacity theo giờ và trải nghiệm member. Metric thiếu unit/window/policy sẽ khiến pricing, expansion và retention đi sai hướng.",
      lessons: [
        defineLesson({
          id: "w11-l01",
          title: "Desk, office và booking utilization",
          durationMinutes: 70,
          summary: "Chuẩn hóa inventory đa loại thành metric đúng granularity thay vì cộng room + desk + m².",
          why: "Private office có capacity desk, hot-desk pool có quantity và meeting room có room-hour; mỗi inventory cần denominator phù hợp.",
          concepts: [
            {
              id: "flex-occupancy-taxonomy",
              term: "Flex occupancy taxonomy",
              definition: "Desk occupancy đo contracted/assigned desk-time; private-office occupancy đo occupied office hoặc workstation-capacity; booking utilization đo reserved/attended time; presence utilization đo actual use.",
              why: "Các metric cùng mô tả demand nhưng ở các grain và evidence khác nhau.",
              actors: ["Coworking operator", "Community manager", "Revenue manager"],
              variants: [
                { name: "Desk occupancy", definition: "Prorated contracted/assigned desks trên prorated available desks.", useWhen: "Theo dõi workplace inventory.", contrastWith: "Không nói người có thật sự ngồi." },
                { name: "Private-office occupancy", definition: "Occupied private office supply theo office-count hoặc workstation-equivalent policy.", useWhen: "Leasing flex offices.", contrastWith: "Count-based và capacity-based cho kết quả khác." },
                { name: "Booking utilization", definition: "Booked resource-hours trên bookable available hours.", useWhen: "Meeting room/event resource.", contrastWith: "Attended utilization cần check-in/sensor." },
              ],
              commonMistake: "Average desk occupancy và office occupancy thành một % mà không quy đổi về cùng workstation-time.",
            },
          ],
          examples: [
            {
              title: "Office lớn trống làm count-based metric đẹp giả",
              context: "Có 10 private office: 9 office 2 chỗ đã occupied, 1 office 20 chỗ đang vacant.",
              scenario: "Office-count occupancy = 9/10 = 90%; workstation-capacity occupancy = 18/38 = 47,4%.",
              outcome: "Operator phải chọn metric theo decision: sales velocity theo unit hay monetized capacity theo workstation.",
              numbers: ["Count occupancy 90%", "Capacity occupancy 47,4%"],
            },
          ],
          relations: [
            { from: "ResourceInventory", to: "AvailableResourceTime", kind: "generates", explanation: "Capacity, opening calendar và holds tạo denominator." },
            { from: "Membership/Booking", to: "OccupiedResourceTime", kind: "generates", explanation: "Contract/booking interval tạo numerator tương ứng." },
          ],
          invariants: [
            "Metric tổng hợp chỉ cộng facts cùng unit hoặc qua conversion policy versioned.",
            "Available supply phải loại opening-hours closure, out-of-service và inventory chưa launched theo policy trước khi tính denominator.",
          ],
          lifecycle: [
            { state: "Inventory configured", trigger: "Resource/capacity/calendar active", businessMeaning: "Supply có thể đưa vào denominator." },
            { state: "Contracted/booked", trigger: "Membership/booking active", businessMeaning: "Demand chiếm resource-time." },
            { state: "Attended", trigger: "Presence evidence", businessMeaning: "Actual-use projection." },
            { state: "Aggregated", trigger: "Daily/monthly close", businessMeaning: "Metrics có version/data coverage." },
          ],
          metrics: [
            { name: "Desk occupancy", formula: "occupied desk-days / available desk-days", interpretation: "Mức bán/assign workstation inventory trong kỳ.", decision: "Pricing, sales và mở rộng desk supply.", caution: "Dedicated desk trong office không double-count ở cả desk và office roll-up." },
            { name: "Booking utilization", formula: "booked resource-hours / bookable resource-hours", interpretation: "Mức reservation của amenity.", decision: "Giờ mở cửa, pricing, convert space.", caution: "Tách attended utilization và buffer/maintenance time." },
          ],
          edgeCases: [
            { case: "Một private office bán theo team chứ không theo desk", risk: "Occupied capacity suy ra bằng plan desk count có thể sai layout thực.", handling: "Lưu commercial capacity basis và physical capacity riêng; metric chọn basis minh bạch." },
          ],
          softwareModels: [
            {
              title: "Fact table theo resource-time unit",
              language: "typescript",
              code: `interface ResourceTimeBase {
  date: string;
  locationId: string;
  available: number;
  contracted: number;
  booked: number;
  attended?: number;
}

type ResourceTimeFact = ResourceTimeBase & (
  | { resourceClass: "hot-desk" | "dedicated-desk"; unit: "desk-hour" }
  | { resourceClass: "private-office"; unit: "office-day" | "workstation-hour" }
  | { resourceClass: "meeting-room"; unit: "room-hour" }
);`,
              explanation: "Discriminated union giữ numerator cạnh denominator cùng grain và ngăn meeting room bị ghi bằng desk-hour.",
            },
          ],
          quiz: [
            { id: "w11-l01-q1", prompt: "9/10 office occupied có đủ nói coworking đạt 90% capacity không?", correctAnswer: "Không. Nếu office trống có capacity lớn, count-based occupancy và workstation-capacity occupancy khác mạnh; phải nêu unit theo decision.", explanation: "Denominator taxonomy quyết định ý nghĩa metric." },
          ],
        }),
        defineLesson({
          id: "w11-l02",
          title: "Revenue occupancy, list-price attainment và yield",
          durationMinutes: 70,
          summary: "Nối inventory-time với recurring và usage revenue để tối ưu price × occupancy.",
          why: "Occupancy cao nhờ discount có thể làm revenue thấp; revenue cao trong tháng nhờ setup fee cũng không phản ánh recurring health.",
          concepts: [
            {
              id: "revenue-occupancy-flex",
              term: "Revenue occupancy",
              definition: "Theo OfficeRnD, tỷ lệ Membership Revenue trên Location Target được cấu hình cho cùng period.",
              why: "Đo mức đạt mục tiêu doanh thu của location; target là business input, không mặc định bằng list price của inventory.",
              actors: ["Revenue manager", "General manager", "Owner"],
            },
            {
              id: "list-price-attainment",
              term: "List Price Attainment",
              definition: "Theo OfficeRnD, tỷ lệ Membership Revenue trên tổng list price của toàn bộ primary assignable resources, kể cả resource chưa occupied.",
              why: "So revenue thực tế với full primary-inventory list-price potential.",
              actors: ["Revenue manager", "Sales lead"],
            },
            {
              id: "occupied-rate-attainment",
              term: "Occupied Rate Attainment (custom)",
              definition: "Tỷ lệ eligible revenue trên list-price potential của riêng inventory đang occupied/contracted.",
              why: "Cô lập discount/rate realization khỏi physical occupancy; đây là custom metric, không phải OfficeRnD List Price Attainment.",
              actors: ["Revenue manager", "Sales lead"],
            },
            {
              id: "mrr",
              term: "Monthly Recurring Revenue (MRR)",
              definition: "Recurring contracted revenue được normalize theo tháng từ active subscriptions, loại one-off và usage không recurring theo policy.",
              why: "Cho run-rate dễ so sánh dù billing cadence tháng/quý/năm.",
              actors: ["Operator", "Finance", "Investor"],
            },
            {
              id: "revpaw-booking-resource-hour",
              term: "RevPAW / Booking Revenue per Available Resource-Hour",
              definition: "Hai metric nối revenue với đúng supply: RevPAW dùng workstation khả dụng; custom booking metric dùng resource-hour có thể bán.",
              why: "So location/resource có quy mô khác và cân bằng price với utilization.",
              actors: ["Revenue manager", "Expansion team"],
            },
          ],
          examples: [
            {
              title: "Hai location cùng occupancy, yield khác",
              context: "A và B đều 80/100 workstation occupied; list price 5 triệu/desk, Location Target 450 triệu. A thu 400 triệu, B thu 320 triệu recurring.",
              scenario: "Revenue Occupancy: A 400/450 = 88,9%, B 320/450 = 71,1%. List Price Attainment trên toàn 100 desks: A 400/500 = 80%, B 320/500 = 64%. Custom Occupied Rate Attainment trên 80 desks: A 100%, B 80%.",
              outcome: "Ba denominator trả lời ba câu hỏi: đạt location target, đạt full-inventory list price, và mức discount trên inventory đã bán.",
              numbers: ["Revenue Occupancy: A 88,9%, B 71,1%", "List Price Attainment: A 80%, B 64%", "Occupied Rate Attainment: A 100%, B 80%"],
            },
          ],
          relations: [
            { from: "MRR", to: "MembershipContract", kind: "derived-from", explanation: "Normalize recurring charge schedule theo active interval." },
            { from: "RevenueOccupancy", to: "LocationTarget", kind: "references", explanation: "Revenue Occupancy dùng configured business target làm denominator." },
            { from: "PrimaryAssignableInventory × ListPrice", to: "ListPricePotential", kind: "generates", explanation: "Full primary inventory tạo denominator của List Price Attainment." },
            { from: "RevPAW/Booking Revenue per Available Resource-Hour", to: "EligibleRevenue", kind: "derived-from", explanation: "Revenue chia resource supply cùng scope/window." },
          ],
          invariants: [
            "Revenue numerator và inventory denominator phải cùng location, resource class, currency và service period.",
            "One-off setup fee, deposit, tax và pass-through không vào MRR nếu metric policy loại chúng.",
          ],
          lifecycle: [
            { state: "Contracted", trigger: "Membership confirmed", businessMeaning: "MRR committed theo term." },
            { state: "Billed", trigger: "Invoice issued", businessMeaning: "Commercial document, có thể khác service-period MRR." },
            { state: "Recognized", trigger: "Service delivered", businessMeaning: "Eligible recurring revenue theo period." },
            { state: "Collected", trigger: "Payment allocated", businessMeaning: "Cash realization; dùng collection metric riêng." },
          ],
          metrics: [
            { name: "Revenue Occupancy", formula: "Membership Revenue / configured Location Target", interpretation: "Mức đạt mục tiêu doanh thu của location.", decision: "Theo dõi performance so với target vận hành.", caution: "Location Target là configured input; không suy diễn thành inventory list price." },
            { name: "List Price Attainment", formula: "Membership Revenue / total list price of all primary assignable resources", interpretation: "Mức đạt full primary-inventory list-price potential.", decision: "Cân bằng occupancy và pricing trên toàn supply.", caution: "Bao gồm cả primary resource chưa occupied trong denominator." },
            { name: "Occupied Rate Attainment (custom)", formula: "eligible revenue / list-price potential of occupied inventory", interpretation: "Rate realization trên inventory đã bán.", decision: "Discount, sales mix và rate integrity.", caution: "Ghi rõ đây là custom metric, không dùng nhãn OfficeRnD List Price Attainment." },
            { name: "MRR", formula: "Σ recurring contract value normalized to one month", interpretation: "Recurring run-rate tại as-of/period.", decision: "Growth, retention và forecast.", caution: "Proration, FX và paused membership cần policy rõ." },
            { name: "RevPAW", formula: "eligible workspace revenue / available workstation equivalents", interpretation: "Revenue yield trên workstation supply.", decision: "Price, product mix và expansion.", caution: "Nêu period; nếu denominator là workstation-month thì revenue cũng phải cùng period." },
            { name: "Booking Revenue per Available Resource-Hour (custom)", formula: "eligible booking revenue / available resource-hours", interpretation: "Yield của meeting/event resource bán theo room/resource-time.", decision: "Dynamic price và opening hours.", caution: "Không gọi là RevPASH: RevPASH dùng seat-hour; closure/buffer phải xử lý như supply policy." },
          ],
          edgeCases: [
            { case: "Annual membership trả trước", risk: "Ghi toàn bộ cash/invoice vào MRR tháng ký.", handling: "Normalize recurring contract value theo service months; cash và deferred revenue ở metrics khác." },
          ],
          softwareModels: [
            {
              title: "Metric numerator mapping",
              language: "pseudo",
              code: `MRR = sum(normalizeMonthly(activeRecurringChargeRules, asOf))

revenueOccupancy = membershipRevenue / configuredLocationTarget
listPriceAttainment = membershipRevenue
  / totalPrimaryAssignableResourceListPrice
occupiedRateAttainment = eligibleWorkspaceRevenue
  / occupiedInventoryListPricePotential
RevPAW = eligibleWorkspaceRevenue / availableWorkstationMonths`,
              explanation: "Cùng source facts nhưng formulas phục vụ câu hỏi khác; mỗi result gắn policy version.",
            },
          ],
          quiz: [
            { id: "w11-l02-q1", prompt: "Nhận 1,2 tỷ tiền membership 12 tháng có làm MRR tháng này là 1,2 tỷ không?", correctAnswer: "Không; MRR normalize recurring value khoảng 100 triệu/tháng nếu term đều. Cash receipt và revenue recognition được đo riêng.", explanation: "Recurring run-rate không đồng nghĩa invoice/cash timing." },
          ],
        }),
        defineLesson({
          id: "w11-l03",
          title: "Retention, contribution margin và metric governance",
          durationMinutes: 65,
          summary: "Đưa occupancy/revenue vào unit economics, cohort và một metric contract có thể tin cậy.",
          why: "Tăng revenue không hữu ích nếu chi phí phục vụ tăng nhanh hơn hoặc khách churn sau khuyến mãi; metric governance giữ team dùng cùng semantics.",
          concepts: [
            {
              id: "flex-unit-economics",
              term: "Flex contribution margin",
              definition: "Revenue trừ variable/avoidable cost để phục vụ location/member/resource trong scope định nghĩa, trước fixed overhead theo policy.",
              why: "Cho biết tăng occupancy/booking có thực sự đóng góp vào economics.",
              actors: ["General manager", "Finance", "Expansion team"],
            },
            {
              id: "cohort-retention",
              term: "Logo/member/revenue retention",
              definition: "Các retention variant theo account count, member count hoặc recurring revenue trong một cohort/horizon.",
              why: "Một customer downsell/up-sell làm count retention và revenue retention khác nhau.",
              actors: ["Member success", "Growth", "Investor"],
            },
            {
              id: "metric-contract",
              term: "Metric contract",
              definition: "Definition có owner, purpose, formula, grain, source, exclusions, version, quality SLA và test cases.",
              why: "Biến metric thành product đáng tin thay vì SQL rải rác sau mỗi chart.",
              actors: ["Product manager", "Data team", "Domain owner"],
            },
          ],
          examples: [
            {
              title: "Khuyến mãi lấp đầy nhưng margin giảm",
              context: "Location tăng occupancy 65% → 85% bằng giảm giá 25% và thêm F&B miễn phí.",
              scenario: "MRR tăng 5%, variable cost tăng 18%, revenue retention sau ba tháng giảm do cohort promo churn.",
              outcome: "Decision không dựa occupancy đơn lẻ; theo contribution margin/resource-time và cohort payback.",
            },
          ],
          relations: [
            { from: "ContributionMargin", to: "Revenue", kind: "derived-from", explanation: "Trừ mapped variable cost cùng scope." },
            { from: "RetentionCohort", to: "MembershipEvents", kind: "derived-from", explanation: "Activation/churn/expansion/contraction theo cohort." },
            { from: "MetricContract", to: "Dashboard", kind: "reported-through", explanation: "Chart phải reference definition version." },
          ],
          invariants: [
            "Churn denominator chỉ gồm population eligible ở đầu kỳ; pause/migration phải có policy.",
            "Net revenue retention có thể >100%, logo retention không; UI validation phải theo metric semantics.",
            "Metric thay definition cần version + backfill/restatement strategy, không silently đổi history.",
          ],
          lifecycle: [
            { state: "Proposed", trigger: "Decision/question được xác định", businessMeaning: "Có hypothesis và owner." },
            { state: "Certified", trigger: "Definition, data quality và test approved", businessMeaning: "Được dùng cho decision chính thức." },
            { state: "Monitored", trigger: "Freshness/quality checks", businessMeaning: "Alert khi source coverage thấp." },
            { state: "Deprecated", trigger: "Metric version thay thế", businessMeaning: "Giữ lịch sử/link migration." },
          ],
          metrics: [
            { name: "Net Revenue Retention", formula: "(starting MRR − churned − contraction + expansion) / starting MRR", interpretation: "Recurring revenue giữ và mở rộng từ cohort cũ.", decision: "Retention, expansion và product value.", caution: "Loại new-logo MRR khỏi numerator." },
            { name: "Contribution margin", formula: "eligible revenue − variable service costs", interpretation: "Economic contribution trước fixed overhead.", decision: "Pricing, hours, plan mix, expansion.", caution: "Cost classification và allocation driver phải versioned." },
            { name: "Data coverage", formula: "valid resource-time có source data / expected resource-time", interpretation: "Độ tin cậy của metric usage.", decision: "Cho phép/không cho phép quyết định tự động.", caution: "Không nhầm missing với zero." },
          ],
          edgeCases: [
            { case: "Member đổi plan trong cùng account", risk: "Đếm churn + new acquisition giả.", handling: "Giữ account/membership lineage, classify plan migration/expansion/contraction riêng." },
          ],
          softwareModels: [
            {
              title: "Metric contract có test case",
              language: "typescript",
              code: `interface MetricContract {
  code: string;
  version: number;
  decision: string;
  owner: string;
  formula: string;
  grain: string[];
  exclusions: string[];
  sourceDatasets: string[];
  qualityThresholds: { freshnessHours: number; coverage: number };
  testCaseIds: string[];
}`,
              explanation: "Metric là managed domain object; dashboard chỉ là một consumer.",
            },
          ],
          quiz: [
            { id: "w11-l03-q1", prompt: "Net Revenue Retention có thể 120% trong khi logo retention 90% không?", correctAnswer: "Có; mất 10% account nhưng expansion từ account còn lại có thể làm recurring revenue cohort tăng 20%.", explanation: "Count, member và revenue retention là các variant khác nhau." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Office-count occupancy và workstation-capacity occupancy dẫn đến quyết định khác nhau thế nào?",
        "MRR, recognized revenue, billed amount và cash collection có đang bị trộn không?",
        "Mỗi chart có metric owner, policy version, data coverage và drill-down chưa?",
      ],
      deliverable: "Xây metric dictionary cho một flex location: desk/office occupancy, booked/attended utilization, MRR, revenue occupancy, RevPAW, NRR và contribution margin.",
      sourceSuggestions: [
        { label: "OfficeRnD Flex Data Hub — revenue, occupancy, bookings and members", url: "https://help.officernd.com/en/articles/248501-data-hub-overview" },
        { label: "OfficeRnD — Benchmark Metrics", url: "https://help.officernd.com/en/articles/310706-flex-data-hub-benchmark-metrics" },
      ],
    }),

    defineWeek({
      id: "week-12",
      number: 12,
      domain: "capstone",
      title: "Reverse Engineering & Capstone",
      subtitle: "Đọc product surface để suy ra domain model, rồi kiểm chứng bằng lifecycle và invariant",
      estimatedHours: 8,
      learningObjectives: [
        "Reverse-engineer OfficeRnD, Yardi và MRI từ nouns, actions, documents, metrics và integration seams.",
        "Vẽ bounded contexts và translation contracts cho Space, Lease, Billing, Facility, Finance, Asset và Flex.",
        "Thiết kế capstone office + coworking xuyên suốt từ contract đến report.",
        "Dùng scenario, invariant và reconciliation test để validate intended-vs-implemented gap.",
      ],
      why:
        "Đích đến không phải nhớ thuật ngữ mà là đọc requirement/UI, hỏi đúng why và suy ra abstraction có thể mở rộng mà vẫn bảo vệ financial/operational truth.",
      lessons: [
        defineLesson({
          id: "w12-l01",
          title: "Reverse-engineer product, không copy UI",
          durationMinutes: 80,
          summary: "Dùng evidence trên product surface để lập giả thuyết domain và tìm counter-example.",
          why: "UI bị tối ưu theo persona/workflow; entity thật có thể ẩn sau import, report, API, trạng thái và edge-case documentation.",
          concepts: [
            {
              id: "reverse-engineering-lens",
              term: "Domain reverse-engineering lens",
              definition: "Chuỗi quan sát Nouns → Commands → Events → States → Documents → Metrics → Permissions → Integrations → failure modes.",
              why: "Mỗi lens tiết lộ identity, lifecycle, invariant và bounded-context seam khác nhau.",
              actors: ["Product engineer", "Domain analyst", "Product manager"],
            },
            {
              id: "product-archetypes",
              term: "Product archetype comparison",
              definition: "OfficeRnD thiên flex/membership/booking; Yardi thể hiện enterprise property/accounting/procurement; MRI nhấn lease-to-ledger và commercial property integration.",
              why: "Khác product strategy tạo khác aggregate boundary; không có một universal schema để copy.",
              actors: ["Architect", "Founder", "Product engineer"],
            },
          ],
          examples: [
            {
              title: "Suy model từ nút Cancel booking",
              context: "Help docs nói cancellation trước 24h hoàn credit, sau đó không hoàn; series occurrence có thể cancel riêng.",
              scenario: "Suy ra booking occurrence, policy version, cutoff timezone, credit reservation/consumption và reversal ledger.",
              outcome: "Tìm thêm invoice/refund/report docs để kiểm chứng; không kết luận chỉ từ form UI.",
            },
          ],
          relations: [
            { from: "ProductSurfaceEvidence", to: "DomainHypothesis", kind: "generates", explanation: "Mỗi hypothesis ghi evidence và confidence." },
            { from: "CounterExample", to: "DomainHypothesis", kind: "references", explanation: "Edge cases falsify/refine model." },
          ],
          invariants: [
            "Phân biệt observation với inference; mọi entity/rule suy ra phải ghi evidence/confidence.",
            "Không copy taxonomy đối thủ mà không map về actor, decision và business model của sản phẩm mình.",
          ],
          lifecycle: [
            { state: "Observe", trigger: "Đọc workflow/docs/API/report", businessMeaning: "Thu nouns/actions/states không phán đoán sớm." },
            { state: "Hypothesize", trigger: "Nhóm patterns", businessMeaning: "Đề xuất aggregate/relation/invariant." },
            { state: "Challenge", trigger: "Tìm edge case/counter-product", businessMeaning: "Kiểm tra generalization quá rộng." },
            { state: "Validate", trigger: "Scenario chạy xuyên lifecycle", businessMeaning: "Model giải thích được evidence và tradeoff." },
          ],
          metrics: [
            { name: "Hypothesis coverage", formula: "critical workflows có model + evidence + edge-case test / workflows selected", interpretation: "Mức hoàn chỉnh reverse engineering.", decision: "Chọn phần cần research tiếp.", caution: "Coverage không đo correctness; confidence/evidence diversity quan trọng." },
          ],
          edgeCases: [
            { case: "Đối thủ dùng cùng nhãn Contract cho lease và membership", risk: "Suy ra một aggregate chung dù lifecycle khác.", handling: "So commands/invariants/money flow; dùng shared abstraction chỉ khi behavior thật sự chung." },
          ],
          softwareModels: [
            {
              title: "Evidence-backed hypothesis card",
              language: "typescript",
              code: `interface DomainHypothesis {
  concept: string;
  proposedBoundary: string;
  evidence: Array<{ source: string; observation: string }>;
  inferredInvariants: string[];
  counterExamples: string[];
  confidence: "low" | "medium" | "high";
  validationQuestions: string[];
}`,
              explanation: "Artifact ép team trả lời why và mức chắc chắn thay vì biến phỏng đoán thành schema ngay.",
            },
          ],
          quiz: [
            { id: "w12-l01-q1", prompt: "Thấy hai màn hình dùng field status giống nhau có đủ generalize thành một enum không?", correctAnswer: "Không. Cần so lifecycle transitions, invariants, actor và side effects; cùng label có thể là hai concept khác context.", explanation: "Generalization dựa trên behavior contract, không chỉ visual similarity." },
          ],
        }),
        defineLesson({
          id: "w12-l02",
          title: "Bounded contexts và integration contracts",
          durationMinutes: 85,
          summary: "Giữ model sâu trong từng domain, kết nối qua identity, event và explicit translation.",
          why: "Shared mega-model giảm duplication ban đầu nhưng tạo coupling: sửa Lease status có thể phá Billing, Occupancy và Investor report.",
          concepts: [
            {
              id: "bounded-context-map",
              term: "Bounded context map",
              definition: "Bản đồ ranh giới ngôn ngữ/model và quan hệ upstream/downstream giữa Space, Lease, Billing, Finance, Facility, Procurement, Asset, Flex.",
              why: "Cho biết khái niệm nào shared identity và khái niệm nào cần translate.",
              actors: ["Principal engineer", "Product team", "Data team"],
            },
            {
              id: "domain-event-contract",
              term: "Domain event contract",
              definition: "Fact quá khứ versioned phát ra từ context owner, có stable identity, occurred/effective time, causation và idempotency semantics.",
              why: "Downstream có thể tự project trạng thái phù hợp mà không đọc trực tiếp bảng nội bộ.",
              actors: ["Backend engineer", "Data engineer", "Integration partner"],
            },
            {
              id: "anti-corruption-layer",
              term: "Anti-corruption layer",
              definition: "Adapter dịch model của hệ thống/đối tác sang ngôn ngữ nội bộ, giữ assumptions và mapping version.",
              why: "Không để schema OfficeRnD/Yardi/MRI trở thành domain model của sản phẩm.",
              actors: ["Integration engineer", "Architect"],
            },
          ],
          examples: [
            {
              title: "Lease commence kích hoạt nhiều context",
              context: "Lease context xác nhận commencement 16/04 cho Suite 5A.",
              scenario: "Phát LeaseCommenced; Space/Occupancy project occupied interval, Billing materialize eligible charges, Access grant possession rights, Asset dashboard refresh forecast.",
              outcome: "Mỗi consumer dùng event fact nhưng giữ policy/projection của mình; retry không double-charge nhờ eventId/idempotency.",
            },
          ],
          relations: [
            { from: "SpaceContext", to: "LeaseContext", kind: "precedes", explanation: "Space publishes stable resource identity/capability." },
            { from: "LeaseContext", to: "BillingContext", kind: "generates", explanation: "Term/charge events là upstream inputs." },
            { from: "BillingContext", to: "FinanceContext", kind: "reported-through", explanation: "Issued documents/payment allocations map sang ledger postings." },
            { from: "AllOperationalContexts", to: "ReportingContext", kind: "reported-through", explanation: "Semantic layer consume facts, không own transactions." },
          ],
          invariants: [
            "Mỗi business fact có một system/context owner; các projection downstream không được mutate source truth.",
            "Event consumer phải idempotent, handle out-of-order/late events và có reconciliation path.",
            "Shared ID không đồng nghĩa shared database table hoặc shared lifecycle.",
          ],
          lifecycle: [
            { state: "Produced", trigger: "Aggregate transaction commits", businessMeaning: "Event/outbox có source version." },
            { state: "Published", trigger: "Reliable dispatcher", businessMeaning: "Contract version được gửi ít nhất một lần." },
            { state: "Projected", trigger: "Consumer xử lý idempotent", businessMeaning: "Local read model/state cập nhật." },
            { state: "Reconciled", trigger: "Scheduled compare/replay", businessMeaning: "Phát hiện và sửa drift có audit." },
          ],
          metrics: [
            { name: "Projection freshness", formula: "now − latest effective source event projected", interpretation: "Độ trễ view downstream.", decision: "Hiển thị stale warning/fail workflow/escalate integration.", caution: "Processing time và business effective time khác nhau." },
            { name: "Reconciliation exception rate", formula: "facts mismatch hoặc missing / facts compared", interpretation: "Độ tin cậy integration.", decision: "Fix mapping/idempotency/data contract.", caution: "Sampling có thể bỏ material amount; đo cả count và value." },
          ],
          edgeCases: [
            { case: "Lease amendment effective quá khứ đến sau invoice event", risk: "Consumer xử lý theo arrival order cho current state sai.", handling: "Event có occurredAt/effectiveAt/version; billing tạo delta, projection rebuild affected window." },
          ],
          softwareModels: [
            {
              title: "Versioned event envelope",
              language: "typescript",
              code: `interface DomainEvent<T> {
  eventId: string;
  eventType: string;
  schemaVersion: number;
  aggregateId: string;
  aggregateVersion: number;
  occurredAt: string;
  effectiveAt: string;
  causationId?: string;
  payload: T;
}

// Consumer stores eventId before committing projection for idempotency.`,
              explanation: "Envelope hỗ trợ ordering, evolution, temporal correction và trace xuyên contexts.",
            },
          ],
          quiz: [
            { id: "w12-l02-q1", prompt: "Billing có nên đọc trực tiếp bảng LeaseCharge nội bộ để chạy mỗi đêm không?", correctAnswer: "Có thể trong modular monolith nhưng vẫn nên qua owner API/application contract hoặc event/outbox; tránh coupling schema/lifecycle và cần snapshot/version để audit.", explanation: "Bounded context là ranh giới model/ownership, không bắt buộc microservice nhưng cần contract rõ." },
          ],
        }),
        defineLesson({
          id: "w12-l03",
          title: "Capstone: Office + Coworking digital twin",
          durationMinutes: 110,
          summary: "Ghép toàn roadmap thành vertical slice có test scenario, reconciliation và stakeholder reports.",
          why: "Domain knowledge chỉ hữu ích khi model sống sót qua lifecycle thật, counter-example và câu hỏi why từ nhiều actor.",
          concepts: [
            {
              id: "capstone-scenario",
              term: "Scenario-driven domain validation",
              definition: "Kiểm chứng model bằng chuỗi given/when/then xuyên time, money và actors thay vì chỉ review entity diagram.",
              why: "Scenario lộ missing state, ambiguous date, double counting và wrong ownership nhanh hơn schema discussion.",
              actors: ["Product engineer", "Domain expert", "QA", "Finance"],
            },
            {
              id: "reconciliation-invariant",
              term: "Cross-domain reconciliation invariant",
              definition: "Điều kiện nối aggregates: billed charge mapping, payment allocation, deposit liability, occupancy resource-time, budget/actual và investor allocation đều phải balance.",
              why: "Local happy paths có thể pass trong khi toàn hệ thống tạo số mâu thuẫn.",
              actors: ["Principal engineer", "Accountant", "Data analyst"],
            },
          ],
          examples: [
            {
              title: "Capstone tháng 4 tại Alpha Hub",
              context: "Tòa nhà 3 tầng: lease office dài hạn, coworking hot desks, meeting rooms và shared HVAC.",
              scenario: "Acme commence giữa tháng + deposit; membership đổi plan; room no-show; AHU failure; emergency vendor PO; utilities accrue; owner/investor close tháng.",
              outcome: "Hệ thống phải tạo đúng occupancy variants, invoice/AR/cash/liability, work/procurement cost, NOI/budget variance và investor projection.",
              numbers: ["1 commercial lease", "1 company membership", "1 failure incident", "1 month-end close"],
            },
          ],
          relations: [
            { from: "ScenarioEvent", to: "DomainCommand", kind: "precedes", explanation: "Mỗi when có expected event/state transition." },
            { from: "DomainFacts", to: "ReconciliationAssertions", kind: "reported-through", explanation: "Assertions kiểm local và cross-context balances." },
            { from: "Metrics", to: "StakeholderDecision", kind: "reported-through", explanation: "Mỗi output trả lời actor sẽ làm gì tiếp." },
          ],
          invariants: [
            "Charge occurrences mapped vào invoices + uninvoiced balance phải reconcile với eligible billed obligation.",
            "Payments = allocated + unapplied + refunded/reversed theo signed policy; deposit liability reconcile receipt/application/refund.",
            "Occupied resource-time không vượt available resource-time theo cùng metric policy; missing denominator trả null.",
            "NOI report reconcile ledger mapping; investor allocation reconcile distributable pool nhưng không đồng nhất investor performance với ledger.",
          ],
          lifecycle: [
            { state: "Domain map", trigger: "Actors/questions/scopes rõ", businessMeaning: "Boundaries và ubiquitous language được review." },
            { state: "Executable scenarios", trigger: "Happy + edge paths được viết", businessMeaning: "Intended behavior kiểm chứng được." },
            { state: "Vertical slice", trigger: "Commands/events/projections chạy", businessMeaning: "Một flow end-to-end thay vì CRUD rời." },
            { state: "Validated", trigger: "Invariants/reconciliation/actor review pass", businessMeaning: "Đủ confidence để mở rộng có kiểm soát." },
          ],
          metrics: [
            { name: "Scenario coverage", formula: "critical lifecycle transitions có assertion / transitions identified", interpretation: "Mức intended behavior được executable hóa.", decision: "Ưu tiên test trước shipping.", caution: "Không chỉ đếm test; cover invariant và failure modes." },
            { name: "Reconciliation pass rate", formula: "reconciliation checks pass / checks run", interpretation: "Cross-domain consistency.", decision: "Block close/release khi material checks fail.", caution: "Threshold theo amount/materiality, không chỉ record count." },
          ],
          edgeCases: [
            { case: "Event replay sau khi metric policy nâng version", risk: "Historical dashboard silently đổi và owner report published lệch.", handling: "Tạo new metric snapshot/version; giữ published report immutable và disclose restatement." },
          ],
          softwareModels: [
            {
              title: "Capstone acceptance sketch",
              language: "pseudo",
              code: `Given Suite A available 01-30 Apr
And lease commences 16 Apr with 300m refundable deposit
When April billing and close run
Then base-rent charge is prorated by declared policy
And deposit receipt increases Cash and DepositLiability, not Revenue
And lease occupancy uses 15 occupied-days over eligible available-days
And Owner NOI reconciles to operating ledger mapping

Given meeting room booking is no-show
Then booked utilization increases
And attended utilization does not
And credit consume/release follows cancellation policy version`,
              explanation: "Acceptance nối why, temporal policy, money classification và metric semantics trong một story.",
            },
          ],
          quiz: [
            { id: "w12-l03-q1", prompt: "Capstone được coi là xong khi entity diagram đủ bảng chưa?", correctAnswer: "Chưa. Cần executable lifecycle scenarios, edge cases, invariants, reconciliation và stakeholder decision outputs.", explanation: "Schema chỉ biểu diễn data shape; domain correctness nằm ở behavior theo thời gian." },
          ],
        }),
      ],
      checkpointQuestions: [
        "Mỗi inference từ product đối thủ có evidence và counter-example nào?",
        "Context nào own Space, Lease, Invoice, Ledger, Work Order và Metric Definition?",
        "Capstone có chứng minh Charge ≠ InvoiceLine, Cash ≠ Revenue, Occupied ≠ Utilized và Investor performance ≠ Ledger không?",
      ],
      deliverable: "Hoàn thiện domain map, event catalog, 12 scenario tests, metric dictionary và one-page architecture decision record cho Alpha Hub.",
      sourceSuggestions: [
        { label: "OfficeRnD Help Center", url: "https://help.officernd.com/" },
        { label: "Yardi Commercial product documentation", url: "https://www.yardi.com/market/commercial/" },
        { label: "MRI Commercial property & accounting documentation", url: "https://www.mrisoftware.com/solutions/commercial-real-estate-software/" },
      ],
    }),
  ],
} satisfies Course;

export const courseModules = curriculum.modules;
export const courseWeeks: LearningWeek[] = curriculum.weeks;
export const allLessons: Lesson[] = courseWeeks.flatMap((week) => week.lessons);
export const relationNodes: RelationNode[] = [...relationNodeCatalog];

const weeksById = new Map(courseWeeks.map((week) => [week.id, week]));
const weeksByNumber = new Map(courseWeeks.map((week) => [week.number, week]));
const lessonsById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));

/** Look up a week by its stable ID, for example `week-05`. */
export function getWeekById(id: string): LearningWeek | undefined {
  return weeksById.get(id);
}

/** Look up a week by its one-based roadmap number. */
export function getWeekByNumber(number: number): LearningWeek | undefined {
  return weeksByNumber.get(number);
}

/** Look up a lesson by its stable ID, for example `w05-l02`. */
export function getLessonById(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

/** Return both lesson and parent week when navigation needs full context. */
export function getLessonContext(id: string): { week: LearningWeek; lesson: Lesson } | undefined {
  for (const week of courseWeeks) {
    const lesson = week.lessons.find((candidate) => candidate.id === id);
    if (lesson) return { week, lesson };
  }
  return undefined;
}

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .trim();

/**
 * Lightweight content search for command palettes and lesson discovery.
 * Search spans lesson metadata and concept vocabulary, ignoring Vietnamese accents.
 */
export function searchLessons(query: string): Array<{ week: LearningWeek; lesson: Lesson }> {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return courseWeeks.flatMap((week) =>
    week.lessons
      .filter((lesson) => {
        const searchable = [
          week.title,
          week.subtitle,
          lesson.title,
          lesson.summary,
          lesson.why,
          ...lesson.concepts.flatMap((concept) => [concept.term, concept.definition, concept.why]),
        ].join(" ");
        return normalizeSearchText(searchable).includes(normalizedQuery);
      })
      .map((lesson) => ({ week, lesson })),
  );
}

export function getAdjacentLesson(id: string): { previous?: Lesson; next?: Lesson } {
  const index = allLessons.findIndex((lesson) => lesson.id === id);
  if (index < 0) return {};
  return {
    previous: index > 0 ? allLessons[index - 1] : undefined,
    next: index < allLessons.length - 1 ? allLessons[index + 1] : undefined,
  };
}

export const courseStats = {
  weeks: courseWeeks.length,
  lessons: allLessons.length,
  concepts: allLessons.reduce((sum, lesson) => sum + lesson.concepts.length, 0),
  estimatedHours: courseWeeks.reduce((sum, week) => sum + week.estimatedHours, 0),
  quizQuestions: allLessons.reduce((sum, lesson) => sum + lesson.quiz.length, 0),
};
