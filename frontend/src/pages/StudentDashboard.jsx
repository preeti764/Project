import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import api, { getUser } from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'mentors', label: 'Mentors' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'forum', label: 'Forum' },
];

export default function StudentDashboard() {
  const user = getUser();
  const [tab, setTab] = useState('overview');
  const [mentors, setMentors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [forumTitle, setForumTitle] = useState('');
  const [forumContent, setForumContent] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [jobsViewedCount, setJobsViewedCount] = useState(() =>
    parseInt(localStorage.getItem('jobsViewedCount') || '0', 10)
  );

  const load = async () => {
    try {
      const [m, j, r, f] = await Promise.all([
        api.get('/mentors'),
        api.get('/jobs'),
        api.get('/mentorship/requests'),
        api.get('/forum'),
      ]);
      setMentors(m.data.mentors);
      setJobs(j.data.jobs);
      setRequests(r.data.requests);
      setPosts(f.data.posts);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to load data' });
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (tab === 'jobs' && jobs.length > 0) {
      const count = Math.max(jobsViewedCount, jobs.length);
      if (count !== jobsViewedCount) {
        setJobsViewedCount(count);
        localStorage.setItem('jobsViewedCount', String(count));
      }
    }
  }, [tab, jobs.length, jobsViewedCount]);

  const requestedAlumni = new Set(
    requests
      .filter((r) => r.status === 'pending' || r.status === 'accepted')
      .map((r) => String(r.alumni?.id))
  );

  const requestMentor = async (alumniId) => {
    try {
      await api.post('/mentorship/request', { alumniId, message: 'I would like mentorship guidance.' });
      toast({ title: 'Sent', description: 'Mentorship request sent' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message });
    }
  };

  const applyJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({ title: 'Applied', description: 'Application submitted' });
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

  const filteredMentors = mentors.filter((m) =>
    `${m.name} ${m.company} ${m.designation}`.toLowerCase().includes(mentorSearch.toLowerCase())
  );
  const filteredJobs = jobs.filter((j) =>
    `${j.title} ${j.company} ${j.jobType}`.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

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
                <p className="text-xs text-zinc-500 mt-1">Student dashboard</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mentors requested', value: requests.length },
                  { label: 'Jobs viewed', value: jobsViewedCount },
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
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                    <Badge variant="outline" className="mt-1">Student</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {tab === 'mentors' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Find Mentors</h1>
                <p className="text-xs text-zinc-500">Browse alumni available for mentorship</p>
              </div>
              <Input placeholder="Search mentors..." value={mentorSearch} onChange={(e) => setMentorSearch(e.target.value)} />
              <div className="space-y-3">
                {filteredMentors.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.designation} at {m.company}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={requestedAlumni.has(String(m.id))}
                        onClick={() => requestMentor(m.id)}
                      >
                        {requestedAlumni.has(String(m.id)) ? 'Requested' : 'Request'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredMentors.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No mentors found</p>}
              </div>
            </>
          )}

          {tab === 'jobs' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Jobs & Internships</h1>
                <p className="text-xs text-zinc-500">Opportunities posted by alumni</p>
              </div>
              <Input placeholder="Search jobs..." value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} />
              <div className="space-y-3">
                {filteredJobs.map((j) => (
                  <Card key={j.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{j.title}</p>
                        <p className="text-xs text-zinc-500">{j.company} · Posted by {j.postedBy?.name}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{j.jobType}</Badge>
                      </div>
                      <Button
                        size="sm"
                        disabled={appliedJobs.has(j.id)}
                        onClick={() => applyJob(j.id)}
                      >
                        {appliedJobs.has(j.id) ? 'Applied' : 'Apply'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredJobs.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No jobs found</p>}
              </div>
            </>
          )}

          {tab === 'forum' && (
            <>
              <div>
                <h1 className="text-lg font-semibold">Discussion Forum</h1>
                <p className="text-xs text-zinc-500">Ask questions and share ideas</p>
              </div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Input placeholder="Post title" value={forumTitle} onChange={(e) => setForumTitle(e.target.value)} />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    placeholder="Write your post..."
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
                {posts.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No posts yet</p>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
