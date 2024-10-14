'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, ArrowUpDown, Menu, X, LayoutDashboard, Database, FilePlus, Search, Upload, Save  } from "lucide-react"
import { DashboardNav } from '@/components/nav'

import { API_URL } from "@/constants";

type SortOption = "college_name" | "company_name" | "role" | "ctc"

function ViewAllData() {
  const [data, setData] = useState<{
    id: number;
    college_name: string;
    company_name: string;
    role: string;
    ctc: number;
}[]>([])
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("college_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    college_name: "",
    company_name: "",
    role: "",
    ctc: 0
  })

  const [sortByDefault, setSortByDefault] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${API_URL}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sort_by: sortBy }), // Send sort_by in the request body
          });
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const result = await response.json();
          setData(result);
        } catch (err ) {
          if (err instanceof Error) {
            alert(err.message);
          }
        } finally {
            setLoading(false);
        }
      };
    
      fetchData();
  }, []);

  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortBy, sortOrder])

  const handleSort = (column: SortOption) => {
    if (sortByDefault) setSortByDefault(false);
    
    if (column === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleEdit = (id: number) => {
    const itemToEdit = data.find(item => item.id === id)
    if (itemToEdit) {
      setEditingId(id)
      setEditForm(itemToEdit)
    }
  }
  
  const handleSave = (id: number) => {
    const item = data.find(item => item.id === id);
    setData(data.map(item => item.id === editingId ? { ...item, ...editForm } : item))
    setEditingId(null)
    if (!item) return alert("item not found for given id: " + id);
    const editFn = async () => {
      try {
        const response = await fetch(`${API_URL}/edit-college-company`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            old_college_name: item.college_name, old_company_name: item.company_name, old_role: item.role, old_ctc: item.ctc,
            new_college_name: editForm.college_name, new_company_name: editForm.company_name, new_role: editForm.role, new_ctc: editForm.ctc
           }), 
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result);
        
      } catch (err ) {
        if (err instanceof Error) {
          alert(err.message);
        }
      } finally {}
    }
    editFn();
  }

  const handleDelete = (id: number) => {
    const item = data.find(item => item.id === id);
    setData(data.filter(item => item.id !== id))
    if (!item) return alert("item not found for given id: " + id);
    const deleteFn = async () => {
      try {
        const response = await fetch(`${API_URL}/delete-college-company`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            college_name: item.college_name, company_name: item.company_name, role: item.role, ctc: item.ctc
           }), 
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result);
      } catch (err ) {
        if (err instanceof Error) {
          alert(err.message);
        }
      } finally {}
    }
    deleteFn();
  }

  if (loading) {
    return <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">View All Data</h1>
        <div className="mb-4">
            <div className="animate-pulse flex items-center">
                <div className="h-6 w-32 bg-gray-300 rounded mr-2"></div>
                <div className="h-6 w-24 bg-gray-300 rounded"></div>
            </div>
        </div>
        <div className="rounded-md border">
            <div className="border-b">
                <div className="flex">
                    {['College Name', 'Company Name', 'Role', 'CTC', 'Actions'].map((header) => (
                        <div key={header} className="flex-1 py-2 px-4">
                            <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex border-b last:border-b-0">
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>;
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">View All Data</h1>
      <div className="mb-4">
        <Select onValueChange={(value) => handleSort(value as SortOption)} value={sortByDefault?undefined:sortBy}>
          <div className="flex items-center">
            <h3 className="mr-2">Sort By :</h3>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            
            <div className="ml-auto my-auto">
              <a href={`${API_URL}/download`} className="inline-block bg-blue-600 text-white py-1 px-2 md:py-2 md:px-4 rounded-md hover:bg-blue-700 text-nowrap">
                Download Data
              </a>
            </div>
          </div>
          <SelectContent>
            <SelectItem value="college_name">College Name</SelectItem>
            <SelectItem value="company_name">Company Name</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="ctc">CTC</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] max-w-[200px]">
                <Button variant="ghost" onClick={() => handleSort("college_name")}>
                  College Name
                  {sortBy === "college_name" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="min-w-[200px] max-w-[200px]">
                <Button variant="ghost" onClick={() => handleSort("company_name")}>
                  Company Name
                  {sortBy === "company_name" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="min-w-[200px] max-w-[200px]">
                <Button variant="ghost" onClick={() => handleSort("role")}>
                  Role
                  {sortBy === "role" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[100px]">
                <Button variant="ghost" onClick={() => handleSort("ctc")}>
                  CTC
                  {sortBy === "ctc" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.id} className={index !== sortedData.length - 1 ? "border-b" : ""}>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {editingId === item.id ? (
                    <Input
                      value={editForm.college_name}
                      onChange={(e) => setEditForm({ ...editForm, college_name: e.target.value })}
                    />
                  ) : (
                    item.college_name
                  )}
                </TableCell>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {editingId === item.id ? (
                    <Input
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    />
                  ) : (
                    item.company_name
                  )}
                </TableCell>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {editingId === item.id ? (
                    <Input
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    />
                  ) : (
                    item.role
                  )}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      value={editForm.ctc}
                      onChange={(e) => setEditForm({ ...editForm, ctc: parseInt(e.target.value) })}
                    />
                  ) : (
                    `$${Intl.NumberFormat('en-US').format(item.ctc)}`
                  )}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px]">
                  {editingId === item.id ? (
                    <div className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" className='text-green-500' disabled={(
                                                                                    item.college_name == editForm.college_name && 
                                                                                    item.company_name == editForm.company_name && 
                                                                                    item.role == editForm.role && 
                                                                                    item.ctc == editForm.ctc)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Your Changes</AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to save the following changes:
                              <div className="mt-2">
                                <strong>Current:</strong>
                                <div style={{overflowWrap: "anywhere"}} className='line-clamp-3 overflow-hidden'>{item.college_name} || {item.company_name} || {item.role} || {item.ctc}</div>
                              </div>
                              <div className="mt-2">
                                <strong>New:</strong>
                                <div style={{overflowWrap: "anywhere"}} className='line-clamp-3 overflow-hidden'>{editForm.college_name} || {editForm.company_name} || {editForm.role} || {editForm.ctc}</div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSave(item.id)} className='text-green-500'>Confirm</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button  size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEdit(item.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this entry from our database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className='text-red-500'>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


const navItems = [
  { name: 'Search Data', href: '/', icon: <Search className="mr-2 h-4 w-4" /> },
  { name: 'Add Data', href: '/add', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  { name: 'Edit/Delete Data', href: '/edit', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'View All Data', href: '/view', icon: <Database className="mr-2 h-4 w-4" /> },
  { name: 'Mass Upload', href: '/upload', icon: <Upload className="mr-2 h-4 w-4" /> },
]

export default function() {
  return (
    <div className="min-h-screen ">  
    {/* bg-gray-100 */}
      <DashboardNav navItems = {navItems}/>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ViewAllData/>
      </main>
    </div>
  )
}
