import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FiUsers, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const ROLE_TABS = ['all', 'patient', 'doctor', 'admin'];

const AdminUsers = () => {
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role, search, page],
    queryFn: () => adminAPI.getUsers({ role: role === 'all' ? '' : role, search, page, limit: 12 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateUserStatus(id, { isActive }),
    onSuccess: () => { toast.success('User status updated.'); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Update failed.'),
  });

  const users = data?.data?.data?.users || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{pagination.total ?? 0} registered users</p>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10" placeholder="Search users..." />
        </div>
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card">
          {ROLE_TABS.map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                role === r ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? <LoadingSpinner className="h-64" /> : (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">{u.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge capitalize ${u.role === 'admin' ? 'badge-danger' : u.role === 'doctor' ? 'badge-primary' : 'badge-gray'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.isVerified ? (
                          <FiCheckCircle className="text-green-500 text-lg" />
                        ) : (
                          <FiXCircle className="text-red-400 text-lg" />
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: u._id, isActive: !u.isActive })}
                            className={`btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
