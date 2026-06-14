import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import api, { getUser, setAuth, getToken } from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'post-job', label: 'Post Job' },
  { id: 'requests', label: 'Requests' },
  { id: 'forum', label: 'Forum' },
];

export default function AlumniDashboard() {
  const user = getUser();
  const [tab, setTab] = useState('overview');
  const [available, setAvailable] = useState(user?.availableForMentorship ?? true);
  const [requests, setRequests] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [jobForm, setJobForm] = useState({ title: '', company: '', jobType: 'internship', description: '' });
  const [forumTitle, setForumTitle] = useState('');
  const [forumContent, setForumContent] = useState('');

  const load = async () => {
    try {
      const [r, j, f] = await Promise.all([
        api.get('/mentorship/requests'),
        api.get('/jobs/mine'),
        api.get('/forum'),
      ]);
      setRequests(r.data.requests);
      setMyJobs(j.data.jobs);
      setPosts(f.data.posts);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to load data' });
    }
  };

  useEffect(() => { load(); }, []);

  const toggleAvailability = async (checked) => {
    setAvailable(checked);
    try {
      const { data } = await api.put('/auth/profile', { availableForMentorship: checked });
      setAuth(getToken(), data.user);
      toast({ title: 'Updated', description: checked ? 'Available for mentorship' : 'Mentorship paused' });
    } catch (err) {
      setAvailable(!checked);
      toast({ title: 'Error', description: err.response?.data?.message || err.message });
    }
  };

  const respondRequest = async (id, status) => {
    try {
      await api.put(`/mentorship/requests/${id}`, { status });
      toast({ title: 'Done', description: `Request ${status}` });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message });
    }
  };

  const postJob = async (e) => {
    e.preventDefault();
    const { title, company, jobType, description } = jobForm;
    if (!title || !company || !jobType || !description) {
      toast({ title: 'Error', description: 'All job fields are required' });
      return;
    }
    try {
      await api.post('/jobs', { title, company, jobType, description });
      setJobForm({ title: '', company: '', jobType: 'internship', description: '' });
      toast({ title: 'Posted', description: 'Job posted successfully' });
      load();
      setTab('overview');
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message });
    }
  };

  const postForum = async (e) => {
    e.preventDefault();
    if (!forumTitle.trim() || !forumContent.trim()) {
      toast({ title: 'Error', description: 'Title and content required' });
      return;
    }
    try {
      await api.post('/forum', { title: forumTitle, content: forumContent });
      setForumTitle('');
      setForumContent('');
      toast({ title: 'Posted', description: 'Forum post created' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message });
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-white">
      <Navbar showAuth={false} />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row">
        <Sidebar items={TABS} active={tab} onChange={setTab} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {tab === 'overview' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Welcome, {user?.name}</h1>
                <p className="text-xs text-zinc-500 mt-1">Alumni dashboard</p>
              </div>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Available for mentorship</p>
                    <p className="text-xs text-zinc-500">Students can request you as a mentor</p>
                  </div>
                  <Switch checked={available} onCheckedChange={toggleAvailability} />
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Pending requests', value: pending.length },
                  { label: 'My jobs', value: myJobs.length },
                  { label: 'Accepted', value: requests.filter((r) => r.status === 'accepted').length },
                  { label: 'Forum posts', value: posts.length },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-zinc-500">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profile</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-zinc-500">{user?.designation} at {user?.company}</p>
                    <Badge variant="outline" className="mt-1">Alumni</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {tab === 'post-job' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Post a Job</h1>
                <p className="text-xs text-zinc-500">Share opportunities with students</p>
              </div>
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={postJob} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Job title</Label>
                      <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Software Engineering Intern" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Google" />
                    </div>
                    <div className="space-y-2">
                      <Label>Job type</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['internship', 'full-time', 'part-time'].map((t) => (
                          <Button
                            key={t}
                            type="button"
                            size="sm"
                            variant={jobForm.jobType === t ? 'default' : 'outline'}
                            className="capitalize"
                            onClick={() => setJobForm({ ...jobForm, jobType: t })}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        placeholder="Role details, requirements..."
                      />
                    </div>
                    <Button type="submit">Post Job</Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {tab === 'requests' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Mentorship Requests</h1>
                <p className="text-xs text-zinc-500">Review student requests</p>
              </div>
              <div className="space-y-3">
                {requests.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{r.student?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{r.student?.name}</p>
                          <p className="text-xs text-zinc-500">{r.student?.email}</p>
                          {r.message && <p className="text-xs text-zinc-600 mt-1 italic">"{r.message}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === 'accepted' ? 'default' : 'outline'} className="capitalize">{r.status}</Badge>
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => respondRequest(r.id, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => respondRequest(r.id, 'declined')}>Decline</Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {requests.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No requests yet</p>}
              </div>
            </>
          )}

          {tab === 'forum' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Discussion Forum</h1>
                <p className="text-xs text-zinc-500">Share advice with students</p>
              </div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Input placeholder="Post title" value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    placeholder="Share career advice..."
                    value={forumContent}
                    onChange={(e) => setForumContent(e.target.value)}
                  />
                  <Button size="sm" onClick={postForum}>Post</Button>
                </CardContent>
              </Card>
              <Separator />
              <div className="space-y-3">
                {posts.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-zinc-600 mt-1">{p.content}</p>
                      <p className="text-xs text-zinc-400 mt-2">{p.author?.name} · {p.author?.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
