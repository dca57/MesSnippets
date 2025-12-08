
const TEMPLATE_SUB = `Option Explicit

Public Sub XXXXX()

On Error GoTo GDE

Dim sNomProc As String
sNomProc = "XXXXX" ' ***

Dim bStop As Boolean
Dim sLogMsg As String

sLogMsg = "KO" ' ***

' Début

' Fin

sLogMsg = "OK" ' ***
GDE_Fin:
    On Error Resume Next
    If bStop = True Then Call ADMIN_FIN
    ADMIN_LOG sNomProc & "|" & sLogMsg
    Exit Sub

GDE:
    bStop = True ' ***
    Call ADMIN_GDE(sNomProc, sLogMsg, CInt(err.Number), err.Description, bStop)
    Resume GDE_Fin
    Resume ' Mode Debug
End Sub`;

const TEMPLATE_FCT = `Option Explicit 
 
Public Function XXXXX() As PPPPP

On Error GoTo GDE

Dim sNomProc As String
sNomProc = "XXXXX" ' ***

Dim bStop As Boolean
Dim sLogMsg As String

sLogMsg = "KO" ' ***

XXXXX = FFFFF ' *** Valeur Retour : Initialisation en début de fonction

' Début

' Fin

XXXXX = TTTTT ' *** Valeur Retour : Selon Succès ou Echec de la fonction (sans erreur)
sLogMsg = XXXXX ' ***
GDE_Fin:
    On Error Resume Next
    If bStop = True Then Call ADMIN_FIN
    ADMIN_LOG sNomProc & "|" & sLogMsg
    Exit Function

GDE:
    XXXXX = FFFFF ' *** Valeur Retour : En cas d'Erreur (souvent inutile sauf si la fonction fonctionne 'à l'envers' (= Vrai au départ et jusqu'à preuve du contraire)
    bStop = True ' ***
    Call ADMIN_GDE(sNomProc, sLogMsg, CInt(err.Number), err.Description, bStop)
    Resume GDE_Fin
    Resume ' Mode Debug

End Function`;

export const wrapVBACode = (code: string): string => {
  if (!code) return code;

  // Regex to detect signature and extract Name and Type
  // Matches: Public Sub Name(...) OR Public Function Name(...) As Type
  const signatureRegex = /^(?:Public\s+|Private\s+)?(Sub|Function)\s+(\w+)(?:.*?)(\s+As\s+(\w+))?$/m;
  const match = code.match(signatureRegex);

  if (!match) {
    return code; // Not a recognized VBA Sub/Function
  }

  const type = match[1]; // Sub or Function
  const name = match[2]; // Name of the procedure
  const returnType = match[4] || ''; // Return type (if Function)

  // Extract body content: everything after the signature line until End Sub/Function
  const lines = code.split('\n');
  const signatureIndex = lines.findIndex(line => signatureRegex.test(line));
  
  if (signatureIndex === -1) return code;

  const endRegex = new RegExp(`End\\s+${type}`, 'i');
  const endIndex = lines.findIndex((line, index) => index > signatureIndex && endRegex.test(line));

  if (endIndex === -1) return code;

  // Get the inner code (body)
  const bodyLines = lines.slice(signatureIndex + 1, endIndex);
  
  // Remove blank lines at start and end of body for cleaner insertion
  while (bodyLines.length > 0 && bodyLines[0].trim() === '') bodyLines.shift();
  while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === '') bodyLines.pop();
  
  const innerCode = bodyLines.join('\n');

  let template = '';
  
  if (type === 'Sub') {
    template = TEMPLATE_SUB;
    // Replace Name
    template = template.replace(/XXXXX/g, name);
    // Insert Body
    template = template.replace("' Fin", `${innerCode}\n\n' Fin`);
  } else if (type === 'Function') {
    template = TEMPLATE_FCT;
    
    // Determine return values based on type
    let falseValue = 'False';
    let trueValue = 'True';
    
    const lowerReturnType = returnType.toLowerCase();
    if (lowerReturnType === 'string') {
      falseValue = '""';
      trueValue = '"OK"'; // Or usually just return the string result
    } else if (['integer', 'long', 'double', 'single', 'currency'].includes(lowerReturnType)) {
      falseValue = '0';
      trueValue = '1';
    } else if (lowerReturnType === 'boolean') {
        falseValue = 'False';
        trueValue = 'True';
    } else {
        // Default object or variant
        falseValue = 'Nothing';
        trueValue = 'Nothing'; 
    }

    // Replace Name
    template = template.replace(/XXXXX/g, name);
    // Replace Type
    template = template.replace(/PPPPP/g, returnType || 'Variant');
    // Replace False Return
    template = template.replace(/FFFFF/g, falseValue);
    // Replace True Return
    template = template.replace(/TTTTT/g, trueValue);
    
    // Insert Body
    template = template.replace("' Fin", `${innerCode}\n\n' Fin`);
  }

  // Preserve the original signature line arguments?
  // The user said: "Extract the useful code... insert this useful code... between 'Start and 'End"
  // But the template HAS a signature line: "Public Sub XXXXX()"
  // If the original code has arguments, we need to preserve them in the template signature.
  
  // Update: The template signature is `Public Sub XXXXX()` or `Public Function XXXXX() As Boolean`.
  // We should replace the entire signature line of the template with the original signature line (modified if needed?)
  // Actually, the user requirement 5 says "XXXXX -> procedure name".
  // If the original has arguments, we should probably copy the arguments to the template signature.
  // Let's grab the full arguments part from the match.
  
  const fullSignatureLine = lines[signatureIndex].trim();
  // Regex to capture arguments part: `(...)`
  const argsMatch = fullSignatureLine.match(/\((.*?)\)/);
  const args = argsMatch ? argsMatch[1] : '';

  // Replace signature arguments in template
  // The template has `XXXXX()` -> we need to inject `args` inside `()`
  // Note: Template signature varies slightly by type.
  
  // Easier approach: Replace the first line of the template (which is parsing-friendly) with a reconstructed signature
  // BUT the template has `Option Explicit` then standard structure.
  // Let's just Regex replace `XXXXX()` with `XXXXX(${args})` in the template's signature line.
  
  // Find the signature line in the template (it contains XXXXX and (Public|Sub|Function))
  // The template signature is around line 3.
  
  template = template.replace(/(Sub|Function)\s+([a-zA-Z0-9_]+)\(\)(?:\s+As\s+.+)?/, (matchStr, tType, tName) => {
      // Reconstruct signature
      // We already replaced XXXXX with name globally.
      // So tName should be the name.
      if (type === 'Function') {
          return `Public Function ${name}(${args}) As ${returnType || 'Variant'}`;
      } else {
          return `Public Sub ${name}(${args})`;
      }
  });

  return template;
};
