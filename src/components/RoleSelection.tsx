import { GraduationCap, School as SchoolIcon, Users, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RoleSelection({ onSelectRole }: { onSelectRole: (role: 'teacher' | 'parent' | 'principal') => void }) {
  const { availableSchools, school, setSchool } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-[fade-in-down_0.8s_ease-out]">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4 drop-shadow-sm">
          Integrated School Portal
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Select your school and login to access your dashboard, view student progress, and manage daily activities.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-6xl space-y-8 animate-[fade-in-up_0.8s_ease-out]">

        {/* Step 1: School Selection */}
        <div className="border-b border-gray-200/60 pb-8">
          <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <SchoolIcon className="w-6 h-6 text-blue-600" />
            Step 1: Select Your School
          </label>
          <select
            className="w-full text-lg p-4 border-2 border-transparent bg-white shadow-inner rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none text-gray-700 font-medium cursor-pointer"
            value={school?.udise_code || ''}
            onChange={(e) => {
              const selected = availableSchools.find(s => s.udise_code === e.target.value);
              setSchool(selected || null);
            }}
          >
            <option value="">-- Choose a School from the List --</option>
            {availableSchools.map((s) => (
              <option key={s.id} value={s.udise_code}>
                {s.school_name} (UDISE: {s.udise_code})
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Role Selection */}
        <div className={`transition-all duration-500 ${!school ? 'opacity-40 blur-[1px] pointer-events-none' : 'opacity-100 blur-none'}`}>
          <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            Step 2: Continue As
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              onClick={() => onSelectRole('principal')}
              className="group flex flex-col items-center p-8 bg-gradient-to-b from-white to-purple-50/30 border-2 border-transparent hover:border-purple-400 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 order-1 md:order-none"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <Building2 className="w-12 h-12 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">Principal Login</h2>
              <p className="text-gray-500 text-center leading-relaxed">
                Oversee school performance, view all classes, and monitor student academic data directly
              </p>
            </button>
            <button
              onClick={() => onSelectRole('teacher')}
              className="group flex flex-col items-center p-8 bg-gradient-to-b from-white to-blue-50/30 border-2 border-transparent hover:border-blue-400 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <GraduationCap className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors">Teacher Login</h2>
              <p className="text-gray-500 text-center leading-relaxed">
                Manage your classes, add homework, update marks and student records
              </p>
            </button>

            <button
              onClick={() => onSelectRole('parent')}
              className="group flex flex-col items-center p-8 bg-gradient-to-b from-white to-green-50/30 border-2 border-transparent hover:border-green-400 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <Users className="w-12 h-12 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-700 transition-colors">Parent / Student Login</h2>
              <p className="text-gray-500 text-center leading-relaxed">
                View academic progress, track attendance, and download marksheets
              </p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
