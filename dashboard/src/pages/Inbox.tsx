import { useState } from 'react';
import { Search, Archive, Info, Trash2, Star, Send, Paperclip, Smile, ChevronLeft, MoreVertical, Printer } from 'lucide-react';

interface Email {
  id: number;
  name: string;
  subject: string;
  time: string;
  label: 'Primary' | 'Work' | 'Friends' | 'Social';
  starred: boolean;
  read: boolean;
  messages: Message[];
}

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

const Inbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [activeFolder, setActiveFolder] = useState('inbox');

  const emails: Email[] = [
    {
      id: 1,
      name: 'Juliu Jalal',
      subject: 'Our Bachelor of Commerce program is ACBSP-accredited.',
      time: '8:38 AM',
      label: 'Primary',
      starred: false,
      read: false,
      messages: [
        {
          id: 1,
          sender: 'Juliu Jalal',
          content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
          time: '6:30 pm',
          isOwn: false
        }
      ]
    },
    {
      id: 2,
      name: 'Minerva Barnett',
      subject: 'Get Best Advertiser In Your Side Pocket',
      time: '8:13 AM',
      label: 'Work',
      starred: true,
      read: false,
      messages: [
        {
          id: 1,
          sender: 'Minerva Barnett',
          content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
          time: '6:30 pm',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          content: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
          time: '6:34 pm',
          isOwn: true
        },
        {
          id: 3,
          sender: 'Minerva Barnett',
          content: 'The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default. Contrary to popular belief, Lorem Ipsum is not simply random text is the model text for your company.',
          time: '6:38 pm',
          isOwn: false
        }
      ]
    },
    {
      id: 3,
      name: 'Peter Lewis',
      subject: 'Vacation Home Rental Success',
      time: '7:52 PM',
      label: 'Friends',
      starred: false,
      read: false,
      messages: [
        {
          id: 1,
          sender: 'Peter Lewis',
          content: 'Hello! I wanted to discuss vacation rental opportunities.',
          time: '7:52 pm',
          isOwn: false
        }
      ]
    },
    {
      id: 4,
      name: 'Anthony Briggs',
      subject: 'Free Classifieds Using Them To Promote Your Stuff Online',
      time: '7:52 PM',
      label: 'Primary',
      starred: true,
      read: false,
      messages: [
        {
          id: 1,
          sender: 'Anthony Briggs',
          content: 'Check out these amazing classifieds opportunities!',
          time: '7:52 pm',
          isOwn: false
        }
      ]
    },
    {
      id: 5,
      name: 'Clifford Morgan',
      subject: 'Enhance Your Brand Potential With Giant Advertising Blimps',
      time: '4:13 PM',
      label: 'Social',
      starred: false,
      read: false,
      messages: [
        {
          id: 1,
          sender: 'Clifford Morgan',
          content: 'Let me tell you about our advertising solutions.',
          time: '4:13 pm',
          isOwn: false
        }
      ]
    },
  ];

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Primary':
        return 'bg-teal-100 text-teal-700';
      case 'Work':
        return 'bg-orange-100 text-orange-700';
      case 'Friends':
        return 'bg-pink-100 text-pink-700';
      case 'Social':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleEmailSelection = (id: number) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedEmail) {
      // TODO: Add message to conversation
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="h-full flex gap-4 animate-fade-in overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
        {/* Compose Button */}
        <div className="p-4 border-b border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30">
            + Compose
          </button>
        </div>

        {/* My Email Folders */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">My Email</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveFolder('inbox')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  activeFolder === 'inbox'
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Archive size={16} />
                  <span className="text-sm font-medium">Inbox</span>
                </div>
                <span className={`text-xs font-semibold ${activeFolder === 'inbox' ? 'text-blue-600' : 'text-gray-400'}`}>
                  1253
                </span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  <span className="text-sm font-medium">Starred</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">245</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Send size={16} />
                  <span className="text-sm font-medium">Sent</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">24,532</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Archive size={16} />
                  <span className="text-sm font-medium">Draft</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">09</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span className="text-sm font-medium">Spam</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">14</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  <span className="text-sm font-medium">Important</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">18</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Bin</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">9</span>
              </button>
            </div>
          </div>

          {/* Labels */}
          <div className="p-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Label</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-3 h-3 bg-teal-400 rounded"></div>
                <span className="text-sm text-gray-700">Primary</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-sm text-gray-700">Social</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span className="text-sm text-gray-700">Work</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-3 h-3 bg-pink-400 rounded"></div>
                <span className="text-sm text-gray-700">Friends</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
                + Create New Label
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!selectedEmail ? (
        <div className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
          </div>

          {/* Search & Actions */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search mail"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Archive size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-all group ${
                  !email.read ? 'bg-blue-50/20' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleEmailSelection(email.id);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle star
                  }}
                  className="flex-shrink-0"
                >
                  <Star
                    size={16}
                    className={`${
                      email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    } group-hover:text-yellow-400 transition-colors`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {email.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLabelColor(email.label)}`}>
                      {email.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{email.subject}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{email.time}</span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing 1-12 of 1,253</span>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={18} className="text-gray-600 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Chat View */
        <div className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h2 className="font-bold text-gray-900">{selectedEmail.name}</h2>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getLabelColor(selectedEmail.label)}`}>
                  {selectedEmail.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Printer size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Star size={18} className={selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Trash2 size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {selectedEmail.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`flex items-start gap-3 max-w-2xl ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>
                  <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{msg.time}</span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip size={20} className="text-gray-600" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Write message"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                Send
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
