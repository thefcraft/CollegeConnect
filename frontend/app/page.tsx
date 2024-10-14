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

type SearchResult = {
  id: number;
  college_name: string;
  company_name: string;
  role: string;
  ctc: number;
  hr_name: string | null;
  linkedin_id: string | null;
  email: string | null;
  contact_number: string | null;
}
type SuggestionOption = "college_name" | "company_name" | "role";
type SearchOption = "Filter by Multiple Criteria" | "College Name" | "Company Name" | "Role";
type SortOption = "college_name" | "company_name" | "role" | "ctc"

function SearchData() {
  const [searchOption, setSearchOption] = useState<SearchOption>("College Name")
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  const [sortBy, setSortBy] = useState<SortOption>("college_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const sortedData = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [results, sortBy, sortOrder])

  const [formData, setFormData] = useState({
    collegeName: "",
    companyName: "",
    role: "",
    ctc: "",
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionOption, setSuggestionOption] = useState<SuggestionOption | null>(null)

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<string[]>([])
  const [colleges, setColleges] = useState<string[]>([])
  const [roles, setRoles] = useState<string[]>([])

  
  const [searchLoading, setSearchLoading] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const getCompany = async () => {
          const response = await fetch(`${API_URL}/companies`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const result:{
            id: number;
            company_name: string;
            role: string;
            ctc: number;
          }[] = await response.json();
          const companyNames = Array.from(new Set(result.map(company => company.company_name)));
          const roleNames = Array.from(new Set(result.map(company => company.role)));
          
          setCompanies(companyNames);
          setRoles(roleNames);
        }
        const getCollege = async () => {
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
        }
        await getCompany();
        await getCollege();
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

  const setSearchOptionHandler = (value: SearchOption) => {
    setSearchTerm("");
    setSearchOption(value);
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (searchOption === "Filter by Multiple Criteria"){
      if(suggestionOption === "college_name") setFormData({ ...formData, collegeName: suggestion });
      else if(suggestionOption === "company_name") setFormData({ ...formData, companyName: suggestion });
      else if(suggestionOption === "role") setFormData({ ...formData, role: suggestion });
      setFilteredSuggestions([]);
      return;
    }
    if(suggestionOption === "college_name") setSearchTerm( suggestion );
    else if(suggestionOption === "company_name") setSearchTerm( suggestion );
    else if(suggestionOption === "role") setSearchTerm( suggestion );
    setFilteredSuggestions([]);
  };

  const collegeNameSelect = () => {
    setSuggestionOption("college_name");
    setSuggestions(colleges);
  }
  const companyNameSelect = () => {
    setSuggestionOption("company_name");
    setSuggestions(companies);
  }
  const roleNameSelect = () => {
    setSuggestionOption("role");
    setSuggestions(roles);
  }

  const searchSelect = () => {
    if(searchOption == "College Name") return collegeNameSelect();
    if(searchOption == "Company Name") return companyNameSelect();
    if(searchOption == "Role") return roleNameSelect();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (results.length > 0) setResults([]);
    const { name, value } = e.target;
    if (searchOption === "Filter by Multiple Criteria"){
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value && (name === "collegeName" || name === "companyName" || name === "role")) {
        setFilteredSuggestions(
          suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(value.toLowerCase())
          ).slice(0, 5)
        );
      } else setFilteredSuggestions([]);
      return;
    }
    setSearchTerm(value)
    if (value) {
      setFilteredSuggestions(
        suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
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

  const handleSearch = async () => {
    if (searchOption !== "Filter by Multiple Criteria"  && !searchTerm) {
      alert("Please enter a search term.")
      return;
    }else if(searchOption === "Filter by Multiple Criteria" && !formData.collegeName && !formData.companyName && !formData.role) {
        alert('enter at least one search term!!!');
        return;
    }
    setSearchLoading(true);
    let query: {college_name: string | null, company_name: string | null, role: string | null} = {
      college_name: null,
      company_name: null,
      role: null
    }
    if(searchOption === "Filter by Multiple Criteria" ){
      query.college_name = formData.collegeName;
      query.company_name = formData.companyName;
      query.role = formData.role;
    }
    else if (searchOption === "College Name") query.college_name = searchTerm;
    else if (searchOption === "Company Name") query.company_name = searchTerm;
    else if (searchOption === "Role") query.role = searchTerm;

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
      const items = await response.json();
      if(items.length === 0) {
        alert('No items were found...');
      }
      setResults(items);

    } catch (err ) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
        setSearchLoading(false);
    }
  }

  const handleSort = (column: SortOption) => {
    if (column === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }
  

  if(loading){
    return <MinimalLoading />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4 max-w-md mb-8 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search Data</h1>
        <div>
          <Label htmlFor="searchOption">Search by</Label>
          <Select onValueChange={setSearchOptionHandler} defaultValue={searchOption}>
            <SelectTrigger id="searchOption">
              <SelectValue placeholder="Select search option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="College Name">College Name</SelectItem>
              <SelectItem value="Company Name">Company Name</SelectItem>
              <SelectItem value="Role">Role</SelectItem>
              <SelectItem value="Filter by Multiple Criteria">Filter by Multiple Criteria</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {searchOption !== "Filter by Multiple Criteria" ? (
          <div>
            <Label htmlFor="searchTerm">Search Term</Label>
            <Input
              id="searchTerm"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSelect={searchSelect}
              placeholder={`Enter ${searchOption}`}
            />
            {filteredSuggestions.length > 0 && (
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
        ) : (
          <>
            <div>
              <Label htmlFor="collegeName">College Name (optional)</Label>
              <Input
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={collegeNameSelect}
                placeholder="Enter College Name"
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
            <div>
              <Label htmlFor="companyName">Company Name (optional)</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={companyNameSelect}
                placeholder="Enter Company Name"
              />
              {filteredSuggestions.length > 0  && suggestionOption === "company_name" && (
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
            <div>
              <Label htmlFor="role">Role (optional)</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={roleNameSelect}
                placeholder="Enter Role"
              />
              {filteredSuggestions.length > 0 && suggestionOption === "role" && (
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
          </>
        )}
        <div className="w-full flex justify-center">
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
      {searchLoading && ([...Array(3)].map((_, index) => (
                    <div key={index} className="flex border-b last:border-b-0">
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-muted rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-muted"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-muted rounded"></div>
                        </div>
                        <div className="flex-1 py-4 px-4">
                            <div className="h-8 bg-muted rounded"></div>
                        </div>
                    </div>
                )))}
      {!searchLoading && results.length > 0 && (
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
              <TableHead className="min-w-[100px] max-w-[100px]">
                <Button variant="ghost" disabled>
                  Hr Name
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[100px]">
                <Button variant="ghost" disabled>
                  LinkedIn
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[100px]">
                <Button variant="ghost" disabled>
                  Email
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] max-w-[100px]">
                <Button variant="ghost" disabled>
                  Contact No
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.id} className={index !== sortedData.length - 1 ? "border-b" : ""}>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.college_name}
                </TableCell>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.company_name}
                </TableCell>
                <TableCell className="py-4 min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.role}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {`₹${Intl.NumberFormat('en-US').format(item.ctc)}`}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.hr_name}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.linkedin_id}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.email}
                </TableCell>
                <TableCell className="py-4 min-w-[100px] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.contact_number}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className="min-h-screen">
      <DashboardNav navItems={navItems} />
      {/* bg-gray-100 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <SearchData />
      </main>
    </div>
  );
}
