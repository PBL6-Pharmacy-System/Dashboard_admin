// Category structure matching the Medicine Shop menu
export const CATEGORY_MENU = {
  'thuc-pham-chuc-nang': {
    title: 'Thực phẩm chức năng',
    icon: '💊',
    categories: [
      {
        title: 'Vitamin & Khoáng chất',
        icon: '💊',
        subcategories: [
          'Bổ sung Canxi & Vitamin D',
          'Vitamin tổng hợp',
          'Dầu cá, Omega 3, DHA',
          'Vitamin C các loại',
          'Bổ sung Sắt & Axit Folic',
          'Bổ mắt, bảo vệ mắt'
        ]
      },
      {
        title: 'Sinh lý - Nội tiết tố',
        icon: '🧬',
        subcategories: [
          'Sinh lý nam',
          'Sinh lý nữ',
          'Hỗ trợ mãn kinh',
          'Cân bằng nội tiết tố'
        ]
      },
      {
        title: 'Cải thiện tăng cường chức năng',
        icon: '💪',
        subcategories: [
          'Cơ xương khớp',
          'Hô hấp, ho, xoang',
          'Thận, tiền liệt tuyến'
        ]
      },
      {
        title: 'Hỗ trợ điều trị',
        icon: '🏥',
        subcategories: [
          'Hỗ trợ điều trị trĩ',
          'Hỗ trợ điều trị gout',
          'Hỗ trợ điều trị'
        ]
      },
      {
        title: 'Hỗ trợ tiêu hóa',
        icon: '🌸',
        subcategories: [
          'Táo bón',
          'Khó tiêu',
          'Vi sinh - Probiotic',
          'Dạ dày, tá tràng',
          'Đại tràng',
          'Chức năng gan'
        ]
      },
      {
        title: 'Thần kinh não',
        icon: '🧠',
        subcategories: [
          'Bổ não - cải thiện trí nhớ',
          'Kiểm soát căng thẳng',
          'Hỗ trợ giấc ngủ ngon'
        ]
      },
      {
        title: 'Hỗ trợ làm đẹp',
        icon: '👁️',
        subcategories: [
          'Chăm sóc chuyên sâu cho tóc',
          'Chăm sóc da mặt',
          'Chăm sóc da nứt nẻ',
          'Chống lão hóa',
          'Tóc'
        ]
      },
      {
        title: 'Sức khỏe tim mạch',
        icon: '❤️',
        subcategories: [
          'Huyết áp',
          'Tuần hoàn máu',
          'Giảm Cholesterol'
        ]
      },
      {
        title: 'Dinh dưỡng',
        icon: '🍎',
        subcategories: [
          'Sữa',
          'Nước Yến',
          'Thực phẩm - Đồ uống',
          'Đường ăn kiêng',
          'Tăng sức đề kháng, miễn dịch'
        ]
      }
    ]
  },
  'duoc-my-pham': {
    title: 'Dược mỹ phẩm',
    icon: '🧴',
    categories: [
      {
        title: 'Chăm sóc da mặt',
        icon: '🧴',
        subcategories: [
          'Sữa rửa mặt (Kem, gel, sữa)',
          'Kem chống nắng da mặt',
          'Dưỡng da mặt',
          'Mặt nạ',
          'Serum, Essence hoặc Ampoule',
          'Nước tẩy trang, dầu tẩy trang',
          'Dưỡng da mắt',
          'Hỗ trợ cải thiện quầng thâm, bọng mắt',
          'Hỗ trợ cải thiện nếp nhăn vùng mắt'
        ]
      },
      {
        title: 'Chăm sóc cơ thể',
        icon: '🏃',
        subcategories: [
          'Sữa tắm, xà bông',
          'Kem dưỡng thể',
          'Sữa dưỡng thể, kem dưỡng thể',
          'Tẩy tế bào chết',
          'Chống nắng toàn thân',
          'Lăn khử mùi, xịt khử mùi',
          'Kem dưỡng da tay, chân'
        ]
      },
      {
        title: 'Giải pháp làn da',
        icon: '🧼',
        subcategories: [
          'Trị mụn',
          'Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn',
          'Trị thâm nám',
          'Kem hỗ trợ mờ nám, tàn nhang, đốm nâu',
          'Da nhạy cảm',
          'Da mẫn cảm, dễ kích ứng',
          'Dưỡng da bị khô, thiếu ẩm',
          'Hỗ trợ mờ sẹo, mờ vết thâm',
          'Da'
        ]
      },
      {
        title: 'Chăm sóc tóc - da đầu',
        icon: '💇',
        subcategories: [
          'Dầu gội',
          'Dầu xả',
          'Dầu gội dầu xả',
          'Mặt nạ tóc',
          'Dưỡng tóc, ủ tóc',
          'Dầu gội giúp giảm nấm và ngứa da đầu'
        ]
      },
      {
        title: 'Mỹ phẩm trang điểm',
        icon: '💄',
        subcategories: [
          'Son môi',
          'Trang điểm mặt',
          'Kem nền'
        ]
      }
    ]
  },
  'thuoc': {
    title: 'Thuốc',
    icon: '💊',
    categories: [
      {
        title: 'Tra cứu thuốc',
        icon: '💊',
        subcategories: [
          'Kháng sinh',
          'Thuốc kháng sinh, kháng nấm',
          'Thuốc kháng nấm',
          'Thuốc kháng virus',
          'Điều trị ung thư',
          'Tim mạch máu',
          'Thần kinh',
          'Thuốc thần kinh',
          'Tiêu hóa gan mật',
          'Thuốc dạ dày',
          'Thuốc tiêu hoá',
          'Thuốc trị bệnh gan',
          'Thuốc trị tiêu chảy',
          'Thuốc trị táo bón',
          'Thuốc trị giun sán',
          'Thuốc trị trĩ, suy giãn tĩnh mạch',
          'Thuốc tăng cường tuần hoàn não'
        ]
      },
      {
        title: 'Tra cứu dược chất',
        icon: '🔍',
        subcategories: [
          'Dược chất kháng sinh',
          'Dược chất giảm đau',
          'Dược chất vitamin'
        ]
      },
      {
        title: 'Tra cứu dược liệu',
        icon: '💉',
        subcategories: [
          'Dược liệu đông y',
          'Dược liệu quý hiếm',
          'Dược liệu phổ biến'
        ]
      }
    ]
  },
  'cham-soc-ca-nhan': {
    title: 'Chăm sóc cá nhân',
    icon: '🧼',
    categories: [
      {
        title: 'Vệ sinh cá nhân',
        icon: '🧽',
        subcategories: [
          'Xà phòng',
          'Dung dịch vệ sinh',
          'Dung dịch vệ sinh phụ nữ',
          'Khử mùi',
          'Băng vệ sinh',
          'Bao cao su',
          'Khăn giấy, khăn ướt',
          'Nước rửa tay',
          'Gel bôi trơn'
        ]
      },
      {
        title: 'Chăm sóc răng miệng',
        icon: '🦷',
        subcategories: [
          'Kem đánh răng',
          'Bàn chải đánh răng',
          'Bàn chải điện',
          'Nước súc miệng',
          'Chỉ nha khoa',
          'Chăm sóc răng'
        ]
      },
      {
        title: 'Thực phẩm - Đồ uống',
        icon: '🧴',
        subcategories: [
          'Trà sức khỏe',
          'Trà thảo dược',
          'Mật ong',
          'Nước uống bổ sung',
          'Nước uống không gas',
          'Kẹo cứng'
        ]
      },
      {
        title: 'Chăm sóc đặc biệt',
        icon: '👶',
        subcategories: [
          'Đồ dùng cho bé',
          'Đồ dùng cho mẹ',
          'Sức khoẻ tình dục'
        ]
      },
      {
        title: 'Sức khỏe khác',
        icon: '🩺',
        subcategories: [
          'Suy giãn tĩnh mạch',
          'Vớ ngăn tĩnh mạch',
          'Hoạt huyết',
          'Hỗ trợ trao đổi chất',
          'Giải rượu, cai rượu',
          'Thử thai'
        ]
      }
    ]
  },
  'thiet-bi-y-te': {
    title: 'Thiết bị y tế',
    icon: '🔧',
    categories: [
      {
        title: 'Dụng cụ y tế',
        icon: '🔧',
        subcategories: [
          'Vệ sinh mũi',
          'Dụng cụ vệ sinh mũi',
          'Kim các loại',
          'Máy massage',
          'Túi chườm',
          'Dụng cụ y tế',
          'Dụng cụ cạo râu',
          'Dụng cụ tẩy lông',
          'Vệ sinh tai',
          'Các dụng cụ và sản phẩm khác'
        ]
      },
      {
        title: 'Dụng cụ theo dõi',
        icon: '🩺',
        subcategories: [
          'Nhiệt kế',
          'Máy đo huyết áp',
          'Máy đo đường huyết',
          'Máy, que thử đường huyết',
          'Máy đo SpO2'
        ]
      },
      {
        title: 'Chăm sóc & Bảo vệ',
        icon: '🏥',
        subcategories: [
          'Băng y tế',
          'Bông y tế',
          'Chăm sóc vết thương',
          'Miếng dán giảm đau, hạ sốt',
          'Xịt giảm đau, kháng viêm',
          'Cồn, nước sát trùng, nước muối',
          'Chống muỗi & côn trùng',
          'Kit Test Covid'
        ]
      },
      {
        title: 'Tinh dầu',
        icon: '🌿',
        subcategories: [
          'Tinh dầu',
          'Tinh dầu massage',
          'Tinh dầu xông',
          'Tinh dầu trị cảm'
        ]
      },
      {
        title: 'Khẩu trang',
        icon: '😷',
        subcategories: [
          'Khẩu trang y tế',
          'Khẩu trang N95',
          'Khẩu trang vải'
        ]
      }
    ]
  }
};

export type MainMenuKey = keyof typeof CATEGORY_MENU;
