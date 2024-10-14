"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Edit,
  Trash2,
  ArrowUpDown,
  Menu,
  X,
  LayoutDashboard,
  Database,
  FilePlus,
  Search,
  Upload,
  Save,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { DashboardNav } from "@/components/nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/constants";
import {MinimalLoading} from "@/components/others";
type CompanyData = {
  id: number
  collegeName: string
  companyName: string
  role: string
  ctc: number
}
type SuggestionOption = "college_name" | null

function EditDeleteData() {
  const [collegeName, setCollegeName] = useState("")
  const [searchResults, setSearchResults] = useState<CompanyData[]>([])
  const [uniqueCompanies, setUniqueCompanies] = useState<CompanyData[]>([])
  const [companiesCountRecord, setCompaniesCountRecord] = useState<Record<string, CompanyData[]>>({})
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null)
  const [editForm, setEditForm] = useState({
    companyName: '',
    role: '',
    ctc: 0
  })
  const [editFormReal, setEditFormReal] = useState({
    companyName: '',
    role: '',
    ctc: 0
  })

  const { toast } = useToast();
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionOption, setSuggestionOption] = useState<SuggestionOption | null>(null)


  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/colleges`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result:{
          id: number;
          college_name: string;
        }[] = await response.json();
        const collegeNames = Array.from(new Set(result.map(college => college.college_name)));
        setColleges(collegeNames);
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

  const handleClickOutside = (event: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setFilteredSuggestions([]);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const companiesCountRecordIdentifier = (company: CompanyData)=>{
    return `${company.companyName} - ${company.role}`
  }

  const handleSearch = async () => {
    if (!collegeName) {
      toast({
        title: "Warning",
        description: "Please enter a college name.",
        variant: "destructive",
      })
      return
    }

    let query: {college_name: string | null, company_name: string | null, role: string | null} = {
      college_name: collegeName,
      company_name: null,
      role: null
    }
    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query), // Send sort_by in the request body
      });
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const items: {
        id: number;
        college_name: string;
        company_name: string;
        role: string;
        ctc: number;
      }[] = await response.json();
      if(items.length === 0) {
        alert('No items were found...');
      }
      // const companyNames = Array.from(new Set(result.map(company => company.company_name)));
      const mockResults = items.map(item => 
        ({ id: item.id, collegeName: item.college_name, companyName: item.company_name, role: item.role, ctc: item.ctc })
      )
      setSearchResults(mockResults);
      

      const uc: CompanyData[] = []; // if it is double that takes the first one
      const counts: Record<string, CompanyData[]> = {};
      const seen = new Set();
    
      mockResults.forEach(company => {
        const identifier = companiesCountRecordIdentifier(company);
        // Initialize the array if it doesn't exist
        if (!counts[identifier]) counts[identifier] = [];
        // Count occurrences
        counts[identifier].push(company);
    
        if (!seen.has(identifier)) {
          seen.add(identifier);
          uc.push(company);
        }
      });
      setUniqueCompanies(uc);
      setCompaniesCountRecord(counts);

    } catch (err ) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {}
  }

  const handleCompanySelect = (companyId: string) => {
    const selected = searchResults.find(company => company.id === parseInt(companyId))
    if (selected) {
      setSelectedCompany(selected)
      const value = {
        companyName: selected.companyName,
        role: selected.role,
        ctc: selected.ctc
      }
      setEditForm(value);
      setEditFormReal(value);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {

    const editFn = async () => {
      try {
        const response = await fetch(`${API_URL}/edit-college-company`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            old_college_name: collegeName, old_company_name: editFormReal.companyName, old_role: editFormReal.role, old_ctc: editFormReal.ctc,
            new_college_name: collegeName, new_company_name: editForm.companyName, new_role: editForm.role, new_ctc: editForm.ctc
           }), 
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();

        toast({
          title: "Success",
          description: `Data updated successfully! ${result.data}`,
        })
        
      } catch (err ) {
        if (err instanceof Error) {
          // alert(err.message);
          toast({
            title: "Warning",
            description: err.message,
            variant: "destructive",
          })
        }
      } finally {}
    }

    if (editForm.companyName && editForm.role && editForm.ctc) {
      try {
        const ctcFloat = editForm.ctc
        // Here you would typically make an API call to update the data
        console.log("Updating data:", { ...editForm, ctc: ctcFloat })
        editFn();
        setSelectedCompany(null)
        setSearchResults([])
      } catch (error) {
        toast({
          title: "Error",
          description: "Please enter a valid decimal number for CTC.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Warning",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (selectedCompany) {
      // Here you would typically make an API call to delete the data
      console.log("Deleting data:", selectedCompany)
      
      const deleteFn = async () => {
        try {
          const response = await fetch(`${API_URL}/delete-college-company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              college_name: collegeName, company_name: editFormReal.companyName, role: editFormReal.role, ctc: editFormReal.ctc
             }), 
          });
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          // const result = await response.json();
          toast({
            title: "Success",
            description: `Data deleted successfully!`,
          })
        } catch (err ) {
          if (err instanceof Error) {
            // alert(err.message);
            toast({
              title: "Warning",
              description: err.message,
              variant: "destructive",
            })
          }
        } finally {}
      }
      deleteFn();

      setSelectedCompany(null)
      setSearchResults([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if(suggestionOption === "college_name") setCollegeName(suggestion);
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => 
        // Math.min(prevIndex + 1, filteredSuggestions.length - 1)
        (prevIndex + 1) % (filteredSuggestions.length || 1)  // Prevent division by zero
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => 
        // Math.max(prevIndex - 1, 0)
        (prevIndex - 1 + filteredSuggestions.length) % (filteredSuggestions.length || 1)  // Prevent negative index
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(filteredSuggestions[highlightedIndex]);
      }
    }
  };
  const collegeNameSelect = () => {
    setSuggestionOption("college_name");
    setSuggestions(colleges);
  }

  const handleCollegeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollegeName(e.target.value);
    setSearchResults([]);
    
    if (e.target.value) {
      setFilteredSuggestions(
        suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(e.target.value.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
  };

  if(loading){
    return <MinimalLoading />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4 max-w-md mb-8 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit/Delete Data</h1>
        <div>
          <Label htmlFor="collegeName">College Name</Label>
          <Input
            id="collegeName"
            value={collegeName}
            onChange={handleCollegeInputChange}
            onKeyDown={handleKeyDown}
            onSelect={collegeNameSelect}
            placeholder="Enter College Name to Edit/Delete"
          />
          {filteredSuggestions.length > 0 && suggestionOption === "college_name" && (
            <ul ref={suggestionsRef} className="absolute z-10 mt-1 border border-gray-300 bg-background rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer p-2 ${highlightedIndex === index ? 'bg-muted' : ''}`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button onClick={handleSearch}>Search for Edit/Delete</Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4 max-w-md mb-8 mx-auto">
          <Label htmlFor="companySelect">Select a Company to edit/delete</Label>
          <Select onValueChange={handleCompanySelect}>
            <SelectTrigger id="companySelect">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCompanies.map(company => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.companyName} - {company.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedCompany && (
        <div className="space-y-4 max-w-md mx-auto">
          {companiesCountRecord[companiesCountRecordIdentifier(selectedCompany)] && companiesCountRecord[companiesCountRecordIdentifier(selectedCompany)].length > 1 && (
            <div className="space-y-4 max-w-md mb-8 mx-auto">
              <Label htmlFor="ctcSelect">Select a CTC</Label>
              <Select onValueChange={handleCompanySelect}>
                <SelectTrigger id="ctcSelect">
                  <SelectValue placeholder="Select a CTC" />
                </SelectTrigger>
                <SelectContent>
                  {companiesCountRecord[companiesCountRecordIdentifier(selectedCompany)].map(company => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.ctc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={editForm.companyName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              value={editForm.role}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="ctc">CTC</Label>
            <Input
              id="ctc"
              name="ctc"
              value={editForm.ctc}
              onChange={handleInputChange}
              type="number"
            />
          </div>
          <div className="space-x-4">
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={(
                                    editFormReal.companyName == editForm.companyName && 
                                    editFormReal.role == editForm.role && 
                                    editFormReal.ctc == editForm.ctc) || 
                                  !(
                                      editForm.companyName && editForm.companyName &&
                                      editForm.role && editForm.ctc
                                  ) || 
                                  (editForm.ctc<=0)
                                }>
                    Update Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Your Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to save the following changes:
                    <div className="mt-2">
                      <strong>Current:</strong>
                      <div style={{overflowWrap: "anywhere"}} className='line-clamp-3 overflow-hidden'>{collegeName} || {editFormReal.companyName} || {editFormReal.role} || {editFormReal.ctc}</div>
                    </div>
                    <div className="mt-2">
                      <strong>New:</strong>
                      <div style={{overflowWrap: "anywhere"}} className='line-clamp-3 overflow-hidden'>{collegeName} || {editForm.companyName} || {editForm.role} || {editForm.ctc}</div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpdate} className='text-green-500'>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Data</Button>
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
                  <AlertDialogAction onClick={handleDelete} className='text-red-500'>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  )
}

const navItems = [
  { name: 'Search', href: '/', icon: <Search className="mr-2 h-4 w-4" /> },
  { name: 'Add', href: '/add', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  { name: 'Edit/Delete', href: '/edit', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'View All', href: '/view', icon: <Database className="mr-2 h-4 w-4" /> },
  { name: 'Mass Upload', href: '/upload', icon: <Upload className="mr-2 h-4 w-4" /> },
]

export default function () {
  return (
    <div className="min-h-screen ">
      {/* bg-gray-100 */}
      <DashboardNav navItems={navItems} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EditDeleteData />
      </main>
    </div>
  );
}
