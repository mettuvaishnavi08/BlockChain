export interface Institution {
  id: string;
  name: string;
  address: string;
  isVerified: boolean;
  logoUrl?: string;
  website?: string;
  description?: string;
  registrationDate: string;
}

export interface Student {
  id: string;
  address: string;
  name: string;
  email: string;
  profileImage?: string;
  registrationDate: string;
}

export interface Credential {
  id: string;
  studentAddress: string;
  institutionAddress: string;
  institutionName: string;
  credentialType: string;
  title: string;
  description: string;
  issueDate: string;
  ipfsHash: string;
  issueTxHash: string;
  isValid: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
  metadata: {
    grade?: string;
    courseDuration?: string;
    skills?: string[];
    [key: string]: any;
  };
}

export interface VerificationResult {
  isValid: boolean;
  credential?: Credential;
  institution?: Institution;
  verificationDate: string;
  blockchainVerified: boolean;
  ipfsVerified: boolean;
}

export interface ContractInterface {
  registerInstitution: (name: string, description: string) => Promise<string>;
  verifyInstitution: (address: string) => Promise<string>;
  issueCredential: (
    studentAddress: string,
    credentialData: any,
    ipfsHash: string
  ) => Promise<string>;
  verifyCredential: (credentialId: string) => Promise<VerificationResult>;
  getStudentCredentials: (studentAddress: string) => Promise<Credential[]>;
  getInstitutionCredentials: (institutionAddress: string) => Promise<Credential[]>;
}

export interface IPFSFile {
  path: string;
  hash: string;
  size: number;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  network?: string;
}