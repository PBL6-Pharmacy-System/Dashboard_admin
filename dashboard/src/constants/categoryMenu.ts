// Category structure synced with API /categories/tree
// Last updated: 2025-11-27

export interface Subcategory {
  id: number;
  title: string;
  key: string;
  icon: string;
}

export interface Category {
  id: number;
  title: string;
  key: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface MainCategory {
  id: number;
  title: string;
  key: string;
  icon: string;
  categories: Category[];
}

export const CATEGORY_MENU: Record<string, MainCategory> = {
  'thuc-pham-chuc-nang': {
    id: 128,
    title: 'Thực phẩm chức năng',
    key: 'thuc-pham-chuc-nang',
    icon: '💊',
    categories: [
      {
        id: 132,
        title: 'Vitamin & Khoáng chất',
        key: 'vitamin-khoang-chat',
        icon: '💊',
        subcategories: [
          { id: 14, title: 'Vitamin tổng hợp', key: 'vitamin-tong-hop', icon: '💊' },
          { id: 15, title: 'Bổ sung Canxi & Vitamin D', key: 'canxi-vitamin-d', icon: '🦴' },
          { id: 16, title: 'Vitamin & Khoáng chất', key: 'vitamin-khoang-chat-sub', icon: '💊' },
          { id: 17, title: 'Bổ sung Sắt & Axit Folic', key: 'sat-axit-folic', icon: '🩸' },
          { id: 35, title: 'Dầu cá, Omega 3, DHA', key: 'omega-3-dha', icon: '🐟' },
          { id: 36, title: 'Vitamin C các loại', key: 'vitamin-c', icon: '🍊' }
        ]
      },
      {
        id: 133,
        title: 'Sinh lý - Nội tiết tố',
        key: 'sinh-ly-noi-tiet',
        icon: '🧬',
        subcategories: [
          { id: 40, title: 'Hỗ trợ mãn kinh', key: 'ho-tro-man-kinh', icon: '🌸' },
          { id: 44, title: 'Sức khoẻ tình dục', key: 'suc-khoe-tinh-duc', icon: '💑' },
          { id: 87, title: 'Cân bằng nội tiết tố', key: 'can-bang-noi-tiet-to', icon: '⚖️' },
          { id: 102, title: 'Sinh lý nữ', key: 'sinh-ly-nu', icon: '👩' },
          { id: 124, title: 'Sinh lý nam', key: 'sinh-ly-nam', icon: '👨' }
        ]
      },
      {
        id: 134,
        title: 'Cải thiện tăng cường chức năng',
        key: 'tang-cuong-chuc-nang',
        icon: '💪',
        subcategories: [
          { id: 19, title: 'Hô hấp, ho, xoang', key: 'ho-hap-ho-xoang', icon: '🫁' },
          { id: 32, title: 'Bổ mắt, bảo vệ mắt', key: 'bo-mat-bao-ve-mat', icon: '👁️' },
          { id: 48, title: 'Hỗ trợ trao đổi chất', key: 'ho-tro-trao-doi-chat', icon: '🔄' },
          { id: 56, title: 'Giải rượu, cai rượu', key: 'giai-ruou-cai-ruou', icon: '🍺' },
          { id: 64, title: 'Tăng sức đề kháng, miễn dịch', key: 'tang-suc-de-khang-mien-dich', icon: '🛡️' },
          { id: 80, title: 'Thuốc kháng virus', key: 'thuoc-khang-virus', icon: '💊' },
          { id: 101, title: 'Chức năng gan', key: 'chuc-nang-gan', icon: '🫀' },
          { id: 115, title: 'Chống lão hóa', key: 'chong-lao-hoa', icon: '✨' },
          { id: 120, title: 'Thuốc trị bệnh gan', key: 'thuoc-tri-benh-gan', icon: '🏥' }
        ]
      },
      {
        id: 135,
        title: 'Hỗ trợ điều trị',
        key: 'ho-tro-dieu-tri',
        icon: '🏥',
        subcategories: [
          { id: 18, title: 'Cơ xương khớp', key: 'co-xuong-khop', icon: '🦴' },
          { id: 20, title: 'Hỗ trợ điều trị trĩ', key: 'ho-tro-dieu-tri-tri', icon: '💢' },
          { id: 21, title: 'Thận, tiền liệt tuyến', key: 'than-tien-liet-tuyen', icon: '🫘' },
          { id: 22, title: 'Hỗ trợ điều trị', key: 'ho-tro-dieu-tri-sub', icon: '🩹' },
          { id: 59, title: 'Hỗ trợ điều trị gout', key: 'ho-tro-dieu-tri-gout', icon: '⚠️' },
          { id: 81, title: 'Thuốc trị giun sán', key: 'thuoc-tri-giun-san', icon: '🦠' },
          { id: 82, title: 'Thuốc kháng sinh, kháng nấm', key: 'thuoc-khang-sinh-khang-nam', icon: '💊' },
          { id: 83, title: 'Thuốc kháng nấm', key: 'thuoc-khang-nam', icon: '🍄' }
        ]
      },
      {
        id: 136,
        title: 'Hỗ trợ tiêu hóa',
        key: 'ho-tro-tieu-hoa',
        icon: '🫃',
        subcategories: [
          { id: 46, title: 'Đại tràng', key: 'dai-trang', icon: '🫁' },
          { id: 90, title: 'Khó tiêu', key: 'kho-tieu', icon: '🌿' },
          { id: 96, title: 'Táo bón', key: 'tao-bon', icon: '💊' },
          { id: 108, title: 'Vi sinh - Probiotic', key: 'vi-sinh-probiotic', icon: '🦠' },
          { id: 118, title: 'Thuốc dạ dày', key: 'thuoc-da-day', icon: '💊' },
          { id: 119, title: 'Thuốc tiêu hoá', key: 'thuoc-tieu-hoa', icon: '🏥' },
          { id: 121, title: 'Thuốc trị tiêu chảy', key: 'thuoc-tri-tieu-chay', icon: '💊' },
          { id: 122, title: 'Thuốc trị táo bón', key: 'thuoc-tri-tao-bon', icon: '💊' },
          { id: 123, title: 'Dạ dày, tá tràng', key: 'da-day-ta-trang', icon: '🫄' }
        ]
      },
      {
        id: 137,
        title: 'Thần kinh não',
        key: 'than-kinh-nao',
        icon: '🧠',
        subcategories: [
          { id: 23, title: 'Bổ não - cải thiện trí nhớ', key: 'bo-nao-cai-thien-tri-nho', icon: '🧠' },
          { id: 26, title: 'Hoạt huyết', key: 'hoat-huyet', icon: '💆' },
          { id: 42, title: 'Hỗ trợ giấc ngủ ngon', key: 'ho-tro-giac-ngu-ngon', icon: '😴' },
          { id: 57, title: 'Thuốc tăng cường tuần hoàn não', key: 'thuoc-tang-cuong-tuan-hoan-nao', icon: '🧠' },
          { id: 99, title: 'Kiểm soát căng thẳng', key: 'kiem-soat-cang-thang', icon: '🧘' },
          { id: 110, title: 'Thuốc thần kinh', key: 'thuoc-than-kinh', icon: '💊' },
          { id: 125, title: 'Tuần hoàn máu', key: 'tuan-hoan-mau', icon: '🔄' }
        ]
      },
      {
        id: 138,
        title: 'Hỗ trợ làm đẹp',
        key: 'ho-tro-lam-dep',
        icon: '✨',
        subcategories: [
          { id: 53, title: 'Tóc', key: 'toc', icon: '💇' },
          { id: 103, title: 'Da', key: 'da', icon: '🌟' }
        ]
      },
      {
        id: 139,
        title: 'Sức khỏe tim mạch',
        key: 'suc-khoe-tim-mach',
        icon: '❤️',
        subcategories: [
          { id: 58, title: 'Thuốc trị trĩ, suy giãn tĩnh mạch', key: 'thuoc-tri-tri-suy-gian-tinh-mach', icon: '💊' },
          { id: 85, title: 'Giảm Cholesterol', key: 'giam-cholesterol', icon: '📉' },
          { id: 98, title: 'Suy giãn tĩnh mạch', key: 'suy-gian-tinh-mach', icon: '🩸' },
          { id: 104, title: 'Vớ ngăn tĩnh mạch', key: 'vo-ngan-tinh-mach', icon: '🧦' },
          { id: 109, title: 'Huyết áp', key: 'huyet-ap', icon: '💗' },
          { id: 111, title: 'Máy đo huyết áp', key: 'may-do-huyet-ap', icon: '📊' }
        ]
      },
      {
        id: 140,
        title: 'Dinh dưỡng',
        key: 'dinh-duong',
        icon: '🍼',
        subcategories: [
          { id: 73, title: 'Sữa', key: 'sua', icon: '🥛' }
        ]
      }
    ]
  },
  'duoc-my-pham': {
    id: 129,
    title: 'Dược mỹ phẩm',
    key: 'duoc-my-pham',
    icon: '🧴',
    categories: [
      {
        id: 141,
        title: 'Chăm sóc da mặt',
        key: 'cham-soc-da-mat',
        icon: '✨',
        subcategories: [
          { id: 5, title: 'Sữa rửa mặt (Kem, gel, sữa)', key: 'sua-rua-mat', icon: '🧼' },
          { id: 6, title: 'Nước tẩy trang, dầu tẩy trang', key: 'nuoc-tay-trang-dau-tay-trang', icon: '🧽' },
          { id: 7, title: 'Mặt nạ', key: 'mat-na', icon: '🎭' },
          { id: 8, title: 'Dưỡng da mặt', key: 'duong-da-mat', icon: '💆' },
          { id: 9, title: 'Chăm sóc da mặt', key: 'cham-soc-da-mat-sub', icon: '✨' },
          { id: 52, title: 'Serum, Essence hoặc Ampoule', key: 'serum-essence', icon: '💧' },
          { id: 66, title: 'Trang điểm mặt', key: 'trang-diem-mat', icon: '💄' },
          { id: 71, title: 'Kem chống nắng da mặt', key: 'kem-chong-nang', icon: '☀️' },
          { id: 106, title: 'Son môi', key: 'son-moi', icon: '💋' }
        ]
      },
      {
        id: 142,
        title: 'Chăm sóc cơ thể',
        key: 'cham-soc-co-the',
        icon: '🧴',
        subcategories: [
          { id: 47, title: 'Chăm sóc da nứt nẻ', key: 'cham-soc-da-nut-ne', icon: '🩹' },
          { id: 70, title: 'Chống nắng toàn thân', key: 'chong-nang-toan-than', icon: '☀️' },
          { id: 91, title: 'Sữa dưỡng thể, kem dưỡng thể', key: 'sua-duong-the-kem-duong-the', icon: '💧' },
          { id: 92, title: 'Sữa tắm, xà bông', key: 'sua-tam-xa-bong', icon: '🚿' },
          { id: 113, title: 'Lăn khử mùi, xịt khử mùi', key: 'lan-khu-mui-xit-khu-mui', icon: '🌺' },
          { id: 114, title: 'Kem dưỡng da tay, chân', key: 'kem-duong-da-tay-chan', icon: '🤲' }
        ]
      },
      {
        id: 143,
        title: 'Giải pháp làn da',
        key: 'giai-phap-lan-da',
        icon: '🎯',
        subcategories: [
          { id: 2, title: 'Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn', key: 'kem-ho-tro-giam-mun-gel-ho-tro-giam-mun', icon: '🔴' },
          { id: 10, title: 'Hỗ trợ mờ sẹo, mờ vết thâm', key: 'ho-tro-mo-seo-mo-vet-tham', icon: '🔍' },
          { id: 11, title: 'Da mẫn cảm, dễ kích ứng', key: 'da-man-cam-de-kich-ung', icon: '🌸' },
          { id: 12, title: 'Dưỡng da bị khô, thiếu ẩm', key: 'duong-da-bi-kho-thieu-am', icon: '💧' },
          { id: 95, title: 'Kem hỗ trợ mờ nám, tàn nhang, đốm nâu', key: 'kem-ho-tro-mo-nam-tan-nhang-dom-nau', icon: '✨' }
        ]
      },
      {
        id: 144,
        title: 'Chăm sóc tóc - da đầu',
        key: 'cham-soc-toc',
        icon: '💇',
        subcategories: [
          { id: 3, title: 'Dầu gội giúp giảm nấm và ngứa da đầu', key: 'dau-goi-giup-giam-nam-va-ngua-da-dau', icon: '🦠' },
          { id: 24, title: 'Chăm sóc chuyên sâu cho tóc', key: 'cham-soc-chuyen-sau-cho-toc', icon: '💆' },
          { id: 51, title: 'Dưỡng tóc, ủ tóc', key: 'duong-toc-u-toc', icon: '✨' },
          { id: 107, title: 'Dầu gội dầu xả', key: 'dau-goi-dau-xa', icon: '🧴' }
        ]
      },
      {
        id: 145,
        title: 'Mỹ phẩm trang điểm',
        key: 'my-pham-trang-diem',
        icon: '💄',
        subcategories: []
      },
      {
        id: 146,
        title: 'Chăm sóc da vùng mắt',
        key: 'cham-soc-vung-mat',
        icon: '👁️',
        subcategories: [
          { id: 41, title: 'Hỗ trợ cải thiện quầng thâm, bọng mắt', key: 'ho-tro-cai-thien-quang-tham-bong-mat', icon: '😴' },
          { id: 63, title: 'Hỗ trợ cải thiện nếp nhăn vùng mắt', key: 'ho-tro-cai-thien-nep-nhan-vung-mat', icon: '✨' },
          { id: 100, title: 'Dưỡng da mắt', key: 'duong-da-mat-vung-mat', icon: '💧' }
        ]
      },
      {
        id: 147,
        title: 'Sản phẩm từ thiên nhiên',
        key: 'thien-nhien',
        icon: '🌿',
        subcategories: [
          { id: 97, title: 'Tinh dầu', key: 'tinh-dau', icon: '🌿' }
        ]
      }
    ]
  },
  'cham-soc-ca-nhan': {
    id: 130,
    title: 'Chăm sóc cá nhân',
    key: 'cham-soc-ca-nhan',
    icon: '🧼',
    categories: [
      {
        id: 148,
        title: 'Hỗ trợ tình dục',
        key: 'ho-tro-tinh-duc',
        icon: '💑',
        subcategories: [
          { id: 4, title: 'Gel bôi trơn', key: 'gel-boi-tron', icon: '💧' },
          { id: 94, title: 'Bao cao su', key: 'bao-cao-su', icon: '🛡️' }
        ]
      },
      {
        id: 149,
        title: 'Thực phẩm - Đồ uống',
        key: 'thuc-pham-do-uong',
        icon: '🍵',
        subcategories: [
          { id: 28, title: 'Thực phẩm - Đồ uống', key: 'thuc-pham-do-uong-sub', icon: '🍵' },
          { id: 29, title: 'Nước Yến', key: 'nuoc-yen', icon: '🐦' },
          { id: 30, title: 'Trà thảo dược', key: 'tra-thao-duoc', icon: '🍵' },
          { id: 31, title: 'Nước uống không gas', key: 'nuoc-uong-khong-gas', icon: '🥤' },
          { id: 34, title: 'Kẹo cứng', key: 'keo-cung', icon: '🍬' },
          { id: 105, title: 'Đường ăn kiêng', key: 'duong-an-kieng', icon: '🧂' }
        ]
      },
      {
        id: 150,
        title: 'Vệ sinh cá nhân',
        key: 've-sinh-ca-nhan',
        icon: '🧼',
        subcategories: [
          { id: 33, title: 'Băng vệ sinh', key: 'bang-ve-sinh', icon: '🩸' },
          { id: 61, title: 'Dung dịch vệ sinh phụ nữ', key: 'dung-dich-ve-sinh-phu-nu', icon: '👩' },
          { id: 76, title: 'Vệ sinh tai', key: 've-sinh-tai', icon: '👂' },
          { id: 126, title: 'Nước rửa tay', key: 'nuoc-rua-tay', icon: '🧴' }
        ]
      },
      {
        id: 151,
        title: 'Chăm sóc răng miệng',
        key: 'cham-soc-rang-mieng',
        icon: '🦷',
        subcategories: [
          { id: 38, title: 'Nước súc miệng', key: 'nuoc-suc-mieng', icon: '💦' },
          { id: 60, title: 'Chỉ nha khoa', key: 'chi-nha-khoa', icon: '🧵' },
          { id: 86, title: 'Chăm sóc răng', key: 'cham-soc-rang', icon: '✨' },
          { id: 93, title: 'Kem đánh răng', key: 'kem-danh-rang', icon: '🪥' },
          { id: 112, title: 'Chăm sóc răng miệng', key: 'cham-soc-rang-mieng-sub', icon: '🦷' },
          { id: 116, title: 'Bàn chải điện', key: 'ban-chai-dien', icon: '⚡' }
        ]
      },
      {
        id: 152,
        title: 'Đồ dùng gia đình',
        key: 'do-dung-gia-dinh',
        icon: '🏠',
        subcategories: [
          { id: 62, title: 'Đồ dùng cho bé', key: 'do-dung-cho-be', icon: '👶' },
          { id: 65, title: 'Đồ dùng cho mẹ', key: 'do-dung-cho-me', icon: '🤱' },
          { id: 74, title: 'Chống muỗi & côn trùng', key: 'chong-muoi-con-trung', icon: '🦟' }
        ]
      },
      {
        id: 153,
        title: 'Hàng tổng hợp',
        key: 'hang-tong-hop',
        icon: '🎁',
        subcategories: [
          { id: 49, title: 'Khăn giấy, khăn ướt', key: 'khan-giay-khan-uot', icon: '🧻' }
        ]
      },
      {
        id: 154,
        title: 'Tinh dầu các loại',
        key: 'tinh-dau-cac-loai',
        icon: '🌿',
        subcategories: [
          { id: 72, title: 'Tinh dầu xông', key: 'tinh-dau-xong', icon: '💨' },
          { id: 88, title: 'Tinh dầu trị cảm', key: 'tinh-dau-tri-cam', icon: '🤧' },
          { id: 89, title: 'Tinh dầu massage', key: 'tinh-dau-massage', icon: '💆' }
        ]
      },
      {
        id: 155,
        title: 'Thiết bị làm đẹp',
        key: 'thiet-bi-lam-dep',
        icon: '💅',
        subcategories: [
          { id: 37, title: 'Dụng cụ tẩy lông', key: 'dung-cu-tay-long', icon: '🪒' },
          { id: 77, title: 'Dụng cụ cạo râu', key: 'dung-cu-cao-rau', icon: '🧔' }
        ]
      }
    ]
  },
  'thiet-bi-y-te': {
    id: 131,
    title: 'Thiết bị y tế',
    key: 'thiet-bi-y-te',
    icon: '🩺',
    categories: [
      {
        id: 156,
        title: 'Dụng cụ y tế',
        key: 'dung-cu-y-te',
        icon: '🩺',
        subcategories: [
          { id: 1, title: 'Máy massage', key: 'may-massage', icon: '💆' },
          { id: 13, title: 'Kim các loại', key: 'kim-cac-loai', icon: '💉' },
          { id: 25, title: 'Túi chườm', key: 'tui-chuom', icon: '🧊' },
          { id: 55, title: 'Dụng cụ vệ sinh mũi', key: 'dung-cu-ve-sinh-mui', icon: '👃' },
          { id: 79, title: 'Các dụng cụ và sản phẩm khác', key: 'cac-dung-cu-va-san-pham-khac', icon: '🔧' }
        ]
      },
      {
        id: 157,
        title: 'Dụng cụ theo dõi',
        key: 'dung-cu-theo-doi',
        icon: '📊',
        subcategories: [
          { id: 27, title: 'Máy đo SpO2', key: 'may-do-spo2', icon: '🫁' },
          { id: 39, title: 'Kit Test Covid', key: 'kit-test-covid', icon: '🦠' },
          { id: 50, title: 'Máy, que thử đường huyết', key: 'may-que-thu-duong-huyet', icon: '🩸' },
          { id: 54, title: 'Thử thai', key: 'thu-thai', icon: '🤰' },
          { id: 127, title: 'Nhiệt kế', key: 'nhiet-ke', icon: '🌡️' }
        ]
      },
      {
        id: 158,
        title: 'Dụng cụ sơ cứu',
        key: 'dung-cu-so-cuu',
        icon: '🚑',
        subcategories: [
          { id: 67, title: 'Miếng dán giảm đau, hạ sốt', key: 'mieng-dan-giam-dau-ha-sot', icon: '🌡️' },
          { id: 68, title: 'Băng y tế', key: 'bang-y-te', icon: '🩹' },
          { id: 69, title: 'Bông y tế', key: 'bong-y-te', icon: '☁️' },
          { id: 75, title: 'Cồn, nước sát trùng, nước muối', key: 'con-nuoc-sat-trung-nuoc-muoi', icon: '🧴' },
          { id: 78, title: 'Dụng cụ sơ cứu', key: 'dung-cu-so-cuu-sub', icon: '🩺' },
          { id: 84, title: 'Chăm sóc vết thương', key: 'cham-soc-vet-thuong', icon: '🩹' },
          { id: 117, title: 'Xịt giảm đau, kháng viêm', key: 'xit-giam-dau-khang-viem', icon: '💊' }
        ]
      },
      {
        id: 159,
        title: 'Khẩu trang',
        key: 'khau-trang',
        icon: '😷',
        subcategories: [
          { id: 43, title: 'Khẩu trang vải', key: 'khau-trang-vai', icon: '🎭' },
          { id: 45, title: 'Khẩu trang y tế', key: 'khau-trang-y-te', icon: '😷' }
        ]
      }
    ]
  }
};

export type MainMenuKey = keyof typeof CATEGORY_MENU;

// Helper functions
export const getCategoryById = (id: number): MainCategory | Category | Subcategory | null => {
  for (const mainKey of Object.keys(CATEGORY_MENU)) {
    const mainCat = CATEGORY_MENU[mainKey];
    if (mainCat.id === id) return mainCat;

    for (const cat of mainCat.categories) {
      if (cat.id === id) return cat;

      for (const sub of cat.subcategories) {
        if (sub.id === id) return sub;
      }
    }
  }
  return null;
};

export const getCategoryIdByKey = (key: string): number | null => {
  for (const mainKey of Object.keys(CATEGORY_MENU)) {
    const mainCat = CATEGORY_MENU[mainKey];
    if (mainCat.key === key) return mainCat.id;

    for (const cat of mainCat.categories) {
      if (cat.key === key) return cat.id;

      for (const sub of cat.subcategories) {
        if (sub.key === key) return sub.id;
      }
    }
  }
  return null;
};

export const getAllCategoryIds = (): number[] => {
  const ids: number[] = [];
  
  for (const mainKey of Object.keys(CATEGORY_MENU)) {
    const mainCat = CATEGORY_MENU[mainKey];
    ids.push(mainCat.id);

    for (const cat of mainCat.categories) {
      ids.push(cat.id);

      for (const sub of cat.subcategories) {
        ids.push(sub.id);
      }
    }
  }
  
  return ids;
};

export const buildCategoryIdMap = (): Record<string, { id: number; title: string; level: number; parentId?: number }> => {
  const map: Record<string, { id: number; title: string; level: number; parentId?: number }> = {};

  for (const mainKey of Object.keys(CATEGORY_MENU)) {
    const mainCat = CATEGORY_MENU[mainKey];
    map[mainCat.key] = { id: mainCat.id, title: mainCat.title, level: 0 };

    for (const cat of mainCat.categories) {
      map[cat.key] = { id: cat.id, title: cat.title, level: 1, parentId: mainCat.id };

      for (const sub of cat.subcategories) {
        map[sub.key] = { id: sub.id, title: sub.title, level: 2, parentId: cat.id };
      }
    }
  }

  return map;
};

// Flatten all categories for dropdown/select options
export const getAllCategoriesFlat = (): Array<{ id: number; title: string; level: number; parentTitle?: string }> => {
  const result: Array<{ id: number; title: string; level: number; parentTitle?: string }> = [];

  for (const mainKey of Object.keys(CATEGORY_MENU)) {
    const mainCat = CATEGORY_MENU[mainKey];
    result.push({ id: mainCat.id, title: mainCat.title, level: 0 });

    for (const cat of mainCat.categories) {
      result.push({ id: cat.id, title: cat.title, level: 1, parentTitle: mainCat.title });

      for (const sub of cat.subcategories) {
        result.push({ id: sub.id, title: sub.title, level: 2, parentTitle: cat.title });
      }
    }
  }

  return result;
};
